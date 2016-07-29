defmodule Agbic.GamesChannel do
  use Agbic.Web, :channel
  alias Matchmaker.RoomServer
  alias Agbic.GameRoom
  alias Phoenix.Socket
  require Logger


  # lock room and set start message when max subs reach
  # handle quits in room -> bcast to all and remove the player from state
  # matchmaker needs to handle bad rooms on decrement

  # it'd be nice to monitor the room server too so we could bounce instead of crash?

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
    if authorized?(auth_message) do
      case RoomServer.join(RoomServer, socket.channel_pid, room_id, socket) do
        {:ok, room_pid, {player_num, players}} -> 
          Logger.debug "Player #{player_num} joining room #{room_id}"
          room_ref = Process.monitor(room_pid)
          payload = %{player: player_num, players: players}
          send(self(), {:after_join, payload}) # after joining, handle this msg to bcast
          sock = 
            Socket.assign(socket, :room_pid, room_pid)
            |> Socket.assign(:room_ref, room_ref)
          {:ok, payload, sock}
        {:error, reason} -> 
          Logger.debug "ERROR RoomServer: #{reason}"
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
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_in("match", _payload, socket) do
    {:ok, room_id} = RoomServer.match(RoomServer)
    push(socket, "match", %{:room_id => room_id})
    {:noreply, socket}
  end

  def handle_in("movement", payload, socket) do
    broadcast_from(socket, "movement", payload)
    {:noreply, socket}
  end

  def handle_in("ready", %{"player" => num, "ready" => ready}, socket) do
    # send to GameRoom
    Logger.debug "GamesChannel: received ready signal"
    player_info =  %{:player => num, :ready => ready} # prefer atoms
    GameRoom.player_ready(socket.assigns.room_pid, player_info)
    {:noreply, socket}
  end

  def handle_info({:after_join, player_payload}, socket) do
    broadcast(socket, "player_joined", player_payload)
    {:noreply, socket}
  end

  def handle_info({:player_left, num}, socket) do
    Logger.debug "GamesChannel: player #{num} left, about to notify clients"
    push(socket, "player_left", %{player: num})
    {:noreply, socket}
  end

  def handle_info(:start, socket) do
    Logger.debug "GamesChannel: starting!!!"
    push(socket, "start", %{:start => true})
    {:noreply, socket}
  end

  def handle_info({:DOWN, ref, :process, _pid, _reason}, socket) do
    # leave channel if room goes down (for now)
    # client, however, needs to leave channel or will try to rejoin...
    cond do
      ref == socket.assigns.room_ref -> {:stop, :normal, socket}
      true -> {:noreply, socket}
    end
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end