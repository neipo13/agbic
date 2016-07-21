defmodule Agbic.GamesChannel do
  use Agbic.Web, :channel
  alias Matchmaker.RoomServer
  require Logger

  # unified movement route (still just relay)
  # break lobby out so that we don't confuse w/ game room
  # send every player, every time a new one joins
  # lock room and set start message when max subs reach
  # handle quits in room

  # ---

  # NOTE: channels use different channel_pid per topic,
  # even when created from same socket

  # ---

  def join("games:lobby", payload, socket) do 
    Logger.debug "joining lobby"
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
    Logger.debug "joining room #{room_id}"
    if authorized?(auth_message) do
      case RoomServer.join(RoomServer, socket.channel_pid, room_id, socket) do
        {:ok, _room_pid, player_num} -> 
          Logger.debug "got player num"
          {:ok, %{player: player_num}, socket}
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

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end