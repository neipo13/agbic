defmodule PhaserDemo.Matchmaker.Supervisor do
	use Supervisor

	def start_link() do
		Supervisor.start_link(__MODULE__, [])
	end

	def init([]) do
		children = [
			worker(PhaserDemo.Matchmaker, [], [name: PhaserDemo.Matchmaker])
		]
	end

end