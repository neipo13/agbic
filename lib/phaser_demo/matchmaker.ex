defmodule PhaserDemo.Matchmaker do
	use GenServer
	require Logger

  # NOTE: channels use different channel_pid per topic,
  # even when created from same socket
  # this means we can monitor once through join, one channel per topic, etc.

  # TODO: config

  # TODO: make poolable, ets, recovery? or crash sockets, either way
  # actually -> Process trap exit may be the way to go, since we'll
  # for the sockets to rejoin (consider for yowo as well instead of ets foldl)
  # and, they could rejoin a diff matchmaker and it wouldn't matter

  # TODO: updates to functions, max subs, etc.
  
  
	@max_subscribers 4

	# --- client api ---

	def start_link(opts \\ []) do
		GenServer.start_link(__MODULE__, :ok, opts)
	end

	def match(server) do
		GenServer.call(server, :match)
	end

	def join(server, pid, room_id) do
		GenServer.call(server, {:join, pid, room_id})
	end


	# --- server callbacks ---

	def init(:ok) do
		{:ok, %{
			:channels => Map.new(), 
			:rooms => Map.new(), 
			:max_subscribers => @max_subscribers}
		}
	end

	def handle_call(:match, _from, state) do
		room_id = get_next_available_room(state)
		Logger.debug "Match to room #{room_id}"
		{:reply, {:ok, room_id}, state}
	end

	def handle_call({:join, pid, room_id}, _from, state) do
		# TODO: get available room from matcher funcs
		ref = Process.monitor(pid)
		s = state |> put_channel(room_id, ref) |> increment_room(room_id)
		{:reply, {:ok, ref}, s}
	end

	def handle_info({:DOWN, ref, :process, _pid, _reason}, state) do
		case Map.fetch(state.channels, ref) do
			{:ok, room_id} -> {:noreply, state |> drop_channel(ref) |> decrement_room(room_id)}
			:error -> {:noreply, state}
		end
	end

	def handle_info(_msg, state) do
		{:noreply, state}
	end

	defp get_next_available_room(state) do
		# TODO: if state has filter funcs or precedence funcs for matches, 
		# then use recursively (w/ prev winner, etc.)
		# also factor wait time and room count
		rooms = 
			state
			|> filter_max_subs()
			|> Enum.map(fn {room_id, _ct} -> room_id end)
		case rooms do 
			[] -> gen_new_room()
			[h|_t] -> h
		end
	end

	defp filter_max_subs(state) do
		state.rooms |> Enum.filter(fn {_room_id, ct} -> ct < state.max_subscribers end)
	end

	defp gen_new_room() do
		UUID.uuid4(:weak)
	end

	defp put_channel(state, room_id, ref) do
		%{state | channels: Map.put(state.channels, ref, room_id)}
	end

	defp drop_channel(state, ref) do
		%{state | channels: Map.delete(state.channels, ref)}
	end

	defp increment_room(state, room_id) do
		count = 
			case Map.fetch(state.rooms, room_id) do
				{:ok, ct} -> ct + 1
				:error -> 1
			end
		%{state | rooms: Map.put(state.rooms, room_id, count)}
	end

	defp decrement_room(state, room_id) do
		case Map.fetch(state.rooms, room_id) do
			{:ok, ct} -> %{state | rooms: Map.put(state.rooms, room_id, ct - 1)}
			:error -> state
		end
	end
end