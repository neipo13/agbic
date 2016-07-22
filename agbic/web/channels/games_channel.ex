defmodule Agbic.GamesChannel do
  use Agbic.Web, :channel
  alias Matchmaker.RoomServer
  alias Phoenix.Socket
  require Logger

  # break lobby out so that we don't confuse w/ game room
    # this should be okay, just know to disconnect!!!
  # send every player, every time a new one joins
  # lock room and set start message when max subs reach
  # handle quits in room
  
  # NEED to know how to disconnect from a channel, esp. lobby
  # do this after joining room
  # it'd be nice to monitor the room server too so we could bounce instead of crash?

  # ---

  # NOTE: channels use different channel_pid per topic,
  # even when created from same socket

  # ---

  def join("games:lobby", payload, socket) do 
    Logger.debug "joining lobby"
    Logger.debug "here is this pid: "
    IO.inspect self()
    Logger.debug "here is the channel pid:"
    IO.inspect(socket.channel_pid)
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @doc """
    Allow users to join a specific room. once matchmaking is done from lobby.
    This handles all the interroom messaging.
    The RoomServer will create a room process from the configured module
    and pass it the pid and a payload.
    In this case, the payload is the socket, so we can
    broadcast messages when players disconnect.
  """
  def join("games:" <> room_id, auth_message, socket) do
    # TODO: is channel_pid what runs here? or socket? be nice to find out...
    # could impact linking strategies
    # TODO: may need to check if this is a rejoin, but should be okay since we handle crash of channel_pid
    IO.inspect(socket.channel_pid)
    if authorized?(auth_message) do
      case RoomServer.join(RoomServer, socket.channel_pid, room_id, socket) do
        {:ok, room_pid, player_num} -> 
          Logger.debug "got player num"
          room_ref = Process.monitor(room_pid)
          {:ok, %{player: player_num}, Socket.assign(socket, :room_ref, room_ref)}
        {:error, reason} -> 
          Logger.debug "error from RoomServer: #{reason}"
          {:error, %{reason: reason}}
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_in("match", _payload, socket) do
    {:ok, room_id} = RoomServer.match(RoomServer)
    push socket, "match", %{:room_id => room_id}
    {:noreply, socket}
  end

  def handle_in("movement", payload, socket) do
    broadcast_from socket, "movement", payload
    {:noreply, socket}
  end

  def handle_info({:DOWN, ref, :process, _pid, _reason}, socket) do
    # leave channel if room goes down
    cond do
      ref == socket.assigns.room_ref -> {:stop, :normal, Socket}
      true -> {:noreply, socket}
    end
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end