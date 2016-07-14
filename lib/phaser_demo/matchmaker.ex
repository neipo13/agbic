defmodule PhaserDemo.MatchMaker do
	use GenServer


  # NOTE: channels use different channel_pid per topic,
  # even when created from same socket
  # this means we can monitor once through join, one channel per topic, etc.

  # TODO: make poolable somehow? this is potential bottleneck

	@max_subscribers 4

	# --- client api ---

	def start_link(name) do
		GenServer.start_link(__MODULE__, :ok, name: name)
	end

	def match(server, pid) do
		GenServer.call(server, {:monitor, pid})
	end

	# call for  getting the next available room_id (should use funcs pulled from config in init -> later)
	# this will be a recursive loop until we have a match, or none -> new room
	# don't want the case where 1 can get stuck though... 
	# might need to get crafty about wait time too -> use time stamp, give this highest
	# option to ignore wait or set priority

	# updates to funcs (later)

	# monitor func w/ server, room and pid

	# --- server callbacks ---

	def init(:ok) do
		{:ok, %{
			:channels => Map.new(), 
			:rooms => Map.new(), 
			:max_subscribers => @max_subscribers}
		}
	end

	def handle_call({:monitor, pid}, _from, state) do
		# TODO: get available room from matcher funcs
		ref = Process.monitor(pid)
		s = state |> put_channel(room_id, ref) |> increment_room(room_id)
		{:reply, {:ok, room_id}, s}
	end

	def handle_info({:DOWN, ref, :process, _pid, _reason}, state) do
		case Map.fetch(state.channels, ref) do
			{:ok, room_id} -> state |> drop_channel(ref) |> decrement_room(room_id)
			:error -> state
		end
	end

	defp get_next_available_room(state) do
		rooms = 
			state.rooms
			|> filter_max_subs()
			|> Map.keys()
		# TODO: if state has filter funcs or precedence funcs for matches, 
		# then use recursively (w/ prev winner, etc.)
		case rooms do 
			[] -> gen_new_room()
			[h|t] -> h
	end

	defp filter_max_subs(rooms) do
		rooms |> Enum.filter(fn {room_id, ct} -> ct < state.max_subscribers end)
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