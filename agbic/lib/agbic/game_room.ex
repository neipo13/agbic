defmodule Agbic.GameRoom do
  @behaviour Matchmaker.Room
  use GenServer

  # TODO: might be nice to **use** a module and inject some of this,
  # like the join process / trapping

  # consider pg2 or somehow mapping topic to pid of room
  # channel sends msg, update state, bcast to all through Phoenix

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, {:ok, room_id}, [])
  end

  def join(server, room_pid, pid) do
    GenServer.call(server, {:join, pid})
  end

  def close(server) do
    GenServer.stop(server, :normal)
  end

  def init({:ok, room_id}) do
    Process.flag(:trap_exit, true)
    {:ok, %{:room_id => room_id}}
  end

  def handle_call({:join, pid}, _from, state) do
    Process.link(pid) # trap exits of joiners, but crash join channels if room goes down
    {:reply, {:ok, :joined}, state}
  end

  def handle_info({:EXIT, _pid, _reason}, state) do
    {:noreply, state}
  end

  def handle_info(_msg, state) do
    {:noreply, state}
  end
end