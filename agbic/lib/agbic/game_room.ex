defmodule Agbic.GameRoom do
  @behaviour Matchmaker.Room
  use GenServer
  require Logger

  # TODO: convert to agent, and let the channels monitor the room


  def start_link(room_id, room_server) do
    GenServer.start_link(__MODULE__, {:ok, room_id, room_server}, [])
  end

  def join(server, _channel_pid, socket) do
    GenServer.call(server, {:join, socket})
  end

  def leave(server, pid) do
    # TODO: must remove player, and also bcast to others
    GenServer.call(server, {:leave, pid})
  end

  def close(server) do
    Logger.debug "GameRoom stopping..."
    GenServer.stop(server, :normal)
  end

  # ---

  def init({:ok, room_id, room_server}) do
    ref = Process.monitor(room_server)
    {:ok, %{:room_id => room_id, 
      :players => Map.new(), # map player_num to socket
      :player_pids => Map.new(), # map pid to player_num
      :room_server => room_server, 
      :server_ref => ref}}
  end

  def handle_call({:join, socket}, _from, state) do
    {num, nu_state} = assign_player(state, socket, 1)
    # TODO: maybe singal in another field in return_args whether the room has 4 and should start
    # match (either joined, pos) or (koined, pos, ready!) or something
    # then, can signal to lock and bcast start to all
    # then, let client start sending velocity
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

  def handle_info(_msg, state) do
    {:noreply, state}
  end

  # ---

  defp assign_player(state, socket, num) do
    case Map.has_key?(state.players, num) do
      false -> {num, %{state | 
        players: Map.put(state.players, num, socket),
        player_pids: Map.put(state.player_pids, socket.channel_pid, num)}}
      true -> assign_player(state, socket, num + 1)
    end
  end

  defp broadcast(players, msg) do
    players
    |> Enum.each(fn {_num, sock} -> send(sock.channel_pid, msg) end)
  end
end