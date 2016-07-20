defmodule Agbic.PageController do
  use Agbic.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
