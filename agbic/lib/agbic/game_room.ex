defmodule Agbic.GameRoom do
  @behaviour Matchmaker.Room
  use GenServer

  # TODO: convert to agent, and let the channels monitor the room


  def start_link(room_id) do
    GenServer.start_link(__MODULE__, {:ok, room_id}, [])
  end

  def join(server, _channel_pid, socket) do
    GenServer.call(server, {:join, socket})
  end

  def leave(server, pid) do
    # TODO:
  end

  def close(server) do
    GenServer.stop(server, :normal)
  end

  # ---

  def init({:ok, room_id}) do
    {:ok, %{:room_id => room_id, :players => %{}}}
  end

  def handle_call({:join, socket}, _from, state) do
    Process.link(socket.channel_pid) # trap exits of joiners, but crash join channels if room goes down
    {num, st} = assign_player(state, socket, 1)
    # TODO: maybe singal in another field in return_args whether the room has 4 and should start
    # match (either joined, pos) or (koined, pos, ready!) or something
    # then, can signal to lock and bcast start to all
    # then, let client start sending velocity
    players = Map.keys(st.players)
    {:reply, {:ok, :joined, {num, players}}, st}
  end

  def handle_info(_msg, state) do
    {:noreply, state}
  end

  # ---

  defp assign_player(state, socket, num) do
    case Map.has_key?(state.players, num) do
      false -> {num, %{state | players: Map.put(state.players, num, socket)}}
      true -> assign_player(state, socket, num + 1)
    end
  end
end