exports.install = function() {
	GROUP(['authorize'], function() {
		ROUTE('GET      /api/tasks/                  *Task --> @query');
		ROUTE('GET      /api/tasks/archive/          *Task --> @archive');
		ROUTE('POST     /api/tasks/                  *Task --> @insert');
		ROUTE('GET      /api/tasks/{id}/complete/    *Task --> @complete');
		ROUTE('GET      /api/tasks/clear/            *Task --> @clear');
		ROUTE('GET      /api/users/                  *User --> @query');
	});

	WEBSOCKET('/', socket, ['json', 'authorize']);
};

function socket() {
	var self = this;
	MAIN.ws = self;
	self.autodestroy(() => MAIN.ws = null);
}