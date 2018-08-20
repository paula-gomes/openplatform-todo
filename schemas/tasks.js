NEWSCHEMA('Task', function(schema) {

	schema.define('userid', 'UID');
	schema.define('body', 'String', true);
	schema.define('deadline', Date);

	schema.setInsert(function($) {

		var model = $.model;
		var data = {};

		data.id = UID();
		data.ownerid = $.user.id;
		data.userid = model.userid;
		data.body = model.body;
		data.deadline = model.deadline;
		data.completed = false;

		if (data.userid && data.userid !== data.ownerid) {

			// send a notification
			var user = MAIN.users[$.user.openplatformid].users.findItem('id', data.userid);
			user && MAIN.notify(user, $.user.name + ': ' + data.body, null, data.id);
			if (MAIN.sessions[data.userid]) {
				var msg = CLONE(data);
				msg.TYPE = 'add';
				MAIN.send(data.userid, msg);
			}
		}

		TABLE('tasks').insert(data).callback(() => $.success(data.id));
	});

	schema.addWorkflow('complete', function($) {

		var db = TABLE('tasks');
		var completed = $.query.is === '1';
		var id = $.options.id || $.id;

		db.one().where('id', id).or().where('ownerid', $.user.id).where('userid', $.user.id).end().callback(function(err, doc) {

			if (doc.completed !== completed) {

				if (completed && doc.ownerid !== $.user.id) {
					var user = MAIN.users[$.user.openplatformid].users.findItem('id', doc.ownerid);
					user && MAIN.badge(user);
				}

				var data = {};
				data.id = doc.id;
				data.completed = completed;

				if (doc.userid === $.user.id)
					MAIN.send(doc.ownerid, data);
				else if (doc.userid && doc.ownerid === $.user.id)
					MAIN.send(doc.userid, data);

				db.modify({ completed: completed, updated: NOW }).where('id', id).callback($.done());

			} else
				$.success(true);
		});
	});

	schema.addWorkflow('clear', function($) {
		TABLE('tasks').remove().where('ownerid', $.user.id).where('completed', true).callback($.done());
	});

	schema.setQuery(function($) {
		TABLE('tasks').find2().or().where('ownerid', $.user.id).where('userid', $.user.id).end().callback($.callback);
	});

});