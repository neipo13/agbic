defmodule Agbic.GameRoom do
  @behaviour Matchmaker.Room
  use GenServer
  require Logger

  
  # TODO: run matchmaker as embedded so we can deal w/pooling and upgrading max subs?
  # or alternately, just read from ets, change if you upgrade matchmaker
  # or don't allow change, but for now, just get this working...

  @max_subscribers Application.get_env(:matchmaker, Matchmaker.Supervisor)[:max_subscribers]

  def start_link(room_id, room_server) do
    GenServer.start_link(__MODULE__, {:ok, room_id, room_server}, [])
  end

  def join(room, _channel_pid, socket) do
    Logger.debug "GameRoom handling player join"
    GenServer.call(room, {:join, socket})
  end

  def leave(room, pid) do
    Logger.debug "GameRoom removing player"
    GenServer.call(room, {:leave, pid})
  end

  def close(room) do
    Logger.debug "GameRoom stopping..."
    GenServer.stop(room, :normal)
  end

  def player_ready(room, player_info) do
    Logger.debug "GameRoom player ready..."
    GenServer.call(room, {:ready, player_info})
  end

  # ---

  def init({:ok, room_id, room_server}) do
    {:ok, %{:room_id => room_id, 
      :players => Map.new(), # map player_num to {socket, ready} -> upgrade to map or struct if you add more...
      :player_pids => Map.new(), # map pid to player_num
      :room_server => room_server,
      :started => false}}
  end

  def handle_call({:join, socket}, _from, state) do
    {num, nu_state} = assign_player(state, socket, 1)
    players = Map.keys(nu_state.players)
    {:reply, {:ok, :joined, {num, players}}, nu_state}
  end

  def handle_call({:leave, pid}, _from, state) do
    case Map.pop(state.player_pids, pid) do
      {nil, _} -> {:reply, :ok, state}
      {num, nu_pids} -> 
        nu_players = Map.delete(state.players, num)
        broadcast(nu_players, {:player_left, num})
        {:reply,:ok, %{state | players: nu_players, player_pids: nu_pids}}
    end
  end

  def handle_call({:ready, player_info}, _from, state) do
    unless state.started do
      case Map.fetch(state.players, player_info.player) do
        {:ok, {sock, _r}} -> 
          player = {sock, player_info.ready}
          players = Map.put(state.players, player_info.player, player)
          if all_ready?(players) do
            send self(), :start # handle start signal after reply
          end
          {:reply, :ok, %{state | players: players}}
        :error -> {:reply, :error, state} 
      end
    else
      {:reply, :error, state}
    end
  end

  def handle_info(:start, state) do
    # make sure still all ready
    case all_ready?(state.players) do
      true -> 
        broadcast(state.players, :start)
        {:noreply, %{state | started: true}}
      false -> {:noreply, state}
    end
  end

  def handle_info(_msg, state) do
    {:noreply, state}
  end

  # ---

  defp assign_player(state, socket, num) do
    case Map.has_key?(state.players, num) do
      false -> {num, %{state | 
        players: Map.put(state.players, num, {socket, false}),
        player_pids: Map.put(state.player_pids, socket.channel_pid, num)}}
      true -> assign_player(state, socket, num + 1)
    end
  end

  defp broadcast(players, msg) do
    players
    |> Enum.each(fn {_num, {sock, _ready}} -> send(sock.channel_pid, msg) end)
  end

  defp all_ready?(players) do
    ct = players |> Enum.count(fn {_s, ready} -> ready end)
    ct == @max_subscribers
  end
end