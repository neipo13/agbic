defmodule PhaserDemo.LobbyChannel do
  use PhaserDemo.Web, :channel
  alias PhaserDemo.Matchmaker


  # NOTE: channels use different channel_pid per topic,
  # even when created from same socket

  # this means we can monitor once through join, one channel per topic, etc. 

  def join("games:lobby", payload, socket) do 
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end


  @doc"""
    Allow users to join a specific room. once matchmaking is done from lobby.
    This handles all the interroom messaging.
  """
  def join("games:" <> room_id, auth_message, socket) do
    if authorized?(auth_message) do
      {:ok, _ref} = Matchmaker.join(Matchmaker, socket.channel_pid, room_id)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
    {:ok, socket}
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
    {:ok, room_id} = Matchmaker.match(Matchmaker)
    push socket, "match", %{:room_id => room_id}
    {:noreply, socket}
  end

  # broadcast_from for position
  # payload will be the position
  def handle_in("position", payload, socket) do
    broadcast_from socket, "position", payload
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
