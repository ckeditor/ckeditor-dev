/* bender-tags: unit */
/* bender-ckeditor-plugins: notificationaggregator */

( function() {

	'use strict';

	// A type that is going to mimic generic notification type.
	var NotificationMock = sinon.spy( function() {
			return {
				show: sinon.spy(),
				hide: sinon.spy(),
				update: sinon.spy()
			};
		} ),
		Aggregator,
		Task;

	bender.test( {
		setUp: function() {
			// Assign type to more convenient variable.
			Aggregator = CKEDITOR.plugins.notificationAggregator;
			Task = CKEDITOR.plugins.notificationAggregator.task;
			// We don't need real editor, just mock it.
			this.editor = {};
			// We'll replace original notification type so we can track calls, and
			// reduce dependencies.
			// Reassign and reset the spy each TC, so eg. callCount will be reset.
			CKEDITOR.plugins.notification = NotificationMock;
			NotificationMock.reset();
		},

		'test exposes Aggregator type': function() {
			assert.isInstanceOf( Function, CKEDITOR.plugins.notificationAggregator, 'Aggregator type is not exposed' );
		},

		'test constructor': function() {
			var aggr = new Aggregator( this.editor, 'msg', 'single msg' );

			assert.areSame( this.editor, aggr.editor, 'Correct editor is stored' );
			assert.isInstanceOf( Array, aggr._tasks, 'Created valid _tasks property' );

			assert.isInstanceOf( CKEDITOR.template, aggr._message, '_message property type' );
			assert.isInstanceOf( CKEDITOR.template, aggr._singularMessage, '_singularMessage property type' );

			// Test message values.
			assert.areSame( 'msg', aggr._message.output() );
			assert.areSame( 'single msg', aggr._singularMessage.output() );
		},

		'test constructor no singular message': function() {
			var aggr = new Aggregator( this.editor, 'msg' );

			assert.isNull( aggr._singularMessage, '_singularMessage value' );
		},

		'test instances does not share _tasks': function() {
			var instance1 = new Aggregator( this.editor, '' ),
				instance2 = new Aggregator( this.editor, '' );

			instance1._tasks.push( 1 );

			assert.areSame( 0, instance2._tasks.length, 'instance2 _tasks remains empty' );
		},

		// If aggregate has no tasks, it should create notification object in createTask method.
		'test createTask creates a notification': function() {
			var aggr = new Aggregator( this.editor, '' ),
				notification = {
					show: sinon.spy()
				};
			aggr.update = sinon.spy();
			aggr._createNotification = sinon.stub().returns( notification );

			aggr.createTask();

			assert.areSame( 1, aggr._createNotification.callCount, '_createNotification call count' );
			assert.areSame( notification, aggr.notification, 'notification property' );

			// Ensure thad notification show was called.
			assert.areSame( 1, notification.show.callCount, 'notification show call count' );

			assert.areSame( 1, aggr.update.callCount, 'update call count' );
		},

		// If there is already at least one task, we need to reuse notification.
		'test createTask reuses a notification when have tasks': function() {
			var aggr = new Aggregator( this.editor, '' );
			aggr._tasks = [ 0 ];
			// Create a dummy notification, so aggregate will think it have one.
			aggr.notification = {};
			aggr.update = sinon.spy();

			aggr.createTask();

			assert.areSame( 0, NotificationMock.callCount, 'Notification constructor call count' );
			assert.areSame( 1, aggr.update.callCount, 'update call count' );
		},

		'test createTask returns value': function() {
			var aggr = new Aggregator( this.editor, '' ),
				taskMock = {
					on: sinon.spy()
				},
				ret;
			aggr._addTask = sinon.stub().returns( taskMock );
			aggr.update = sinon.spy();

			ret = aggr.createTask();

			assert.areSame( taskMock, ret, 'Return value' );
			// Ensure that methods was used.
			sinon.assert.calledOnce( aggr._addTask );
		},

		// Ensure that task will get listeners in createTask.
		'test createTask adds listeners': function() {
			var aggr = new Aggregator( this.editor, '' ),
				taskMock = {
					on: sinon.spy()
				},
				ret;
			aggr._addTask = sinon.stub().returns( taskMock );
			aggr.update = sinon.spy();

			ret = aggr.createTask();

			assert.areSame( 3, taskMock.on.callCount, 'Added listeners count' );
			sinon.assert.calledWithExactly( taskMock.on, 'done', aggr._onTaskDone, aggr );
		},

		// Ensure that nothing bad happens if htere are no weights at all.
		'test getPercentage empty': function() {
			var instance = new Aggregator( this.editor, '' );

			instance.getTasksCount = sinon.stub().returns( 0 );

			assert.areSame( 1, instance.getPercentage(), 'Invalid return value' );
		},

		'test isFinished': function() {
			var instance = new Aggregator( this.editor, '' );
			instance.getDoneTasksCount = sinon.stub().returns( 2 );
			instance.getTasksCount = sinon.stub().returns( 2 );
			assert.isTrue( instance.isFinished(), 'Return value' );
		},

		'test isFinished falsy': function() {
			var instance = new Aggregator( this.editor, '' );
			instance.getDoneTasksCount = sinon.stub().returns( 1 );
			instance.getTasksCount = sinon.stub().returns( 2 );
			assert.isFalse( instance.isFinished(), 'Return value' );
		},

		'test isFinished empty': function() {
			var instance = new Aggregator( this.editor, '' );
			instance.getDoneTasksCount = sinon.stub().returns( 0 );
			instance.getTasksCount = sinon.stub().returns( 0 );
			assert.isTrue( instance.isFinished(), 'Return value' );
		},

		'test getTasksCount': function() {
			var instance = new Aggregator( this.editor, '' );
			instance._tasks = [ 0, 0 ];

			assert.areSame( 2, instance.getTasksCount() );
		},

		'test getDoneTasksCount': function() {
			var instance = new Aggregator( this.editor, '' );
			instance._doneTasks = 3;

			assert.areSame( 3, instance.getDoneTasksCount() );
		},

		'test _addTask': function() {
			var instance = new Aggregator( this.editor, '' ),
				ret = instance._addTask( { weight: 20 } );

			assert.areSame( 1, instance._tasks.length, '_tasks array increased' );
			assert.isInstanceOf( Task, ret, 'Return type' );
			assert.areSame( ret, instance._tasks[ 0 ], 'Return value in _tasks[ 0 ]' );
			assert.areSame( 20, ret._weight );
		},

		// Ensure that aggregator weight cache (_totalWeights) is increased by the
		// addTask call.
		'test _addTask increases weight': function() {
			var instance = new Aggregator( this.editor, '' );

			instance._addTask( { weight: 20 } );

			assert.areSame( 20, instance._totalWeights );
		},

		'test update': function() {
			var instance = new Aggregator( this.editor, '' );
			instance.isFinished = sinon.stub().returns( false );
			instance._updateNotification = sinon.spy();
			instance._finish = sinon.spy();

			instance.update();

			assert.areSame( 1, instance._updateNotification.callCount, '_updateNotification call count' );
			assert.areSame( 0, instance._finish.callCount, '_finish was not called' );
		},

		'test update finished': function() {
			var instance = new Aggregator( this.editor, '' );
			instance.isFinished = sinon.stub().returns( true );
			instance._updateNotification = sinon.spy();
			instance._reset = sinon.spy();
			instance._finish = sinon.spy();

			instance.update();

			assert.areSame( 1, instance._updateNotification.callCount, '_updateNotification call count' );
			assert.areSame( 1, instance._finish.callCount, '_finish call count' );
		},

		'test update - cancel finished event': function() {
			var instance = new Aggregator( this.editor, '' );
			instance.isFinished = sinon.stub().returns( true );
			instance._updateNotification = sinon.spy();
			instance._reset = sinon.spy();
			instance.fire = sinon.stub().returns( false );
			instance.finished = sinon.spy();

			instance.update();

			// Method finished should not be called.
			assert.areSame( 0, instance.finished.callCount, 'finished call count' );
		},

		'test _finish': function() {
			var instance = new Aggregator( this.editor, '' ),
				notif = new NotificationMock(),
				finishedSpy = sinon.spy();

			instance.notification = notif;
			instance.on( 'finished', finishedSpy );
			instance._reset = sinon.spy();

			instance._finish();

			assert.areSame( 1, notif.hide.callCount, 'notification.hide call count' );
			assert.areSame( 1, finishedSpy.callCount, 'finished event fire count' );
			assert.areSame( 1, instance._reset.callCount, 'instance._reset call count' );
		},

		// Ensure that _reset() is called **after** finished event was fired. (#12874)
		'test _finish resets after finished event': function() {
			var instance = new Aggregator( this.editor, '' );

			instance.notification = new NotificationMock();
			instance.fire = function() {
				assert.areSame( 0, instance._reset.callCount, 'instance._reset should not be called before firing finished event' );
			};
			instance._reset = sinon.spy();

			instance._finish();

			assert.areSame( 1, instance._reset.callCount, 'instance._reset call count' );
		},

		'test _updateNotification': function() {
			var instance = new Aggregator( this.editor, '' ),
				expectedParams = {
					message: 'foo',
					progress: 0.75
				};

			instance._getNotificationMessage = sinon.stub().returns( 'foo' );
			instance.getPercentage = sinon.stub().returns( 0.75 );
			instance.notification = new NotificationMock();

			instance._updateNotification();

			sinon.assert.calledWithExactly( instance.notification.update, expectedParams );

			assert.areSame( 1, instance.getPercentage.callCount, 'instance.getPercentage call count' );
		},

		'test _updateNotification notification call': function() {
			var instance = new Aggregator( this.editor, '' );
			instance._message.output = sinon.stub().returns( 'foo' );
			instance.getDoneTasksCount = sinon.stub().returns( 1 );
			instance.getTasksCount = sinon.stub().returns( 4 );
			instance.getPercentage = sinon.stub().returns( 0.25 );
			instance.notification = new NotificationMock();

			instance._updateNotification();

			sinon.assert.calledWithExactly( instance.notification.update, {
				message: 'foo',
				progress: 0.25
			} );

			assert.areSame( 1, instance.notification.update.callCount, 'notification.update call count' );
		},

		'test _removeTask': function() {
			var instance = new Aggregator( this.editor, '' );

			instance.update = sinon.spy();
			instance._tasks = [ 1, 2, 3 ];

			instance._removeTask( 2 );

			assert.areSame( 2, instance._tasks.length, 'instance._tasks length' );
			arrayAssert.itemsAreSame( [ 1, 3 ], instance._tasks );
			assert.areSame( 1, instance.update.callCount, 'instance.update call count' );
		},

		// If aggregator has some _doneWeights already added, and removed task
		// has non-zero _doneWeight then it should be subtracted from the aggregator.
		'test _removeTask subtracts doneWeight': function() {
			var instance = new Aggregator( this.editor, '' ),
				taskMock = {
					_doneWeight: 10
				};

			instance.update = sinon.spy();
			instance._tasks = [ taskMock ];
			instance._doneWeights = 30;

			instance._removeTask( taskMock );

			assert.areSame( 20, instance._doneWeights, 'instance._doneWeights reduced' );
		},

		// Ensure that subsequent remove attempt for the same task won't result with an error.
		'test _removeTask subsequent': function() {
			var instance = new Aggregator( this.editor, '' );

			instance.update = sinon.spy();
			instance._tasks = [ 1, 2 ];

			instance._removeTask( 1 );
			// And the second call.
			instance._removeTask( 1 );

			assert.areSame( 1, instance._tasks.length, 'instance._tasks length' );
		},

		'test _reset': function() {
			var instance = new Aggregator( this.editor, '' );
			instance._tasks = [ 1, 2 ];

			instance._reset();

			assert.areSame( 0, instance._tasks.length, 'instance._tasks cleared' );
		},

		'test _getNotificationMessage': function() {
			var instance = new Aggregator( this.editor, '' );
			instance._message = {
				output: sinon.stub().returns( 'foo' )
			};
			instance.getTasksCount = sinon.stub().returns( 4 );
			instance.getDoneTasksCount = sinon.stub().returns( 1 );
			instance.getPercentage = sinon.stub().returns( 0.25 );

			assert.areSame( 'foo', instance._getNotificationMessage() );
			sinon.assert.calledWithExactly( instance._message.output, {
				current: 1,
				max: 4,
				percentage: 25
			} );
		},

		// When only single task is remaining and special message was defined,
		// we should use special singular message.
		'test _getNotificationMessage single': function() {
			var instance = new Aggregator( this.editor, '' );
			instance._singularMessage = {
				output: sinon.stub().returns( 'bar' )
			};
			instance.getTasksCount = sinon.stub().returns( 2 );
			instance.getDoneTasksCount = sinon.stub().returns( 1 );
			instance.getPercentage = sinon.stub().returns( 0.5 );

			assert.areSame( 'bar', instance._getNotificationMessage() );
			sinon.assert.calledWithExactly( instance._singularMessage.output, {
				current: 1,
				max: 2,
				percentage: 50
			} );
		},

		// Ensure that if only one task is remaining, BUT NO SPECIAL MESSAGE was
		// defined for singular case, the standard message is used.
		'test _getNotificationMessage missing singular': function() {
			var instance = new Aggregator( this.editor, '' );
			instance._message = {
				output: sinon.stub().returns( 'bar' )
			};
			instance.getTasksCount = sinon.stub().returns( 2 );
			instance.getDoneTasksCount = sinon.stub().returns( 1 );
			instance.getPercentage = sinon.stub().returns( 50 );

			assert.areSame( 'bar', instance._getNotificationMessage() );
		},

		'test _createNotification': function() {
			var mock = {
					editor: {},
					_createNotification: Aggregator.prototype._createNotification
				},
				ret = mock._createNotification();

			assert.areSame( 1, NotificationMock.callCount, 'Notification constructor call count' );
			assert.isTrue( NotificationMock.returned( ret ), 'ret was returned by NotificationMock' );
		},

		'test _onTaskUpdate': function() {
			var instance = new Aggregator( this.editor, '' ),
				updateEvent = {
					data: 30
				};

			instance.update = sinon.spy();
			instance._onTaskUpdate( updateEvent );

			assert.areSame( 30, instance._doneWeights, '_doneWeights was modified' );
			assert.areSame( 1, instance.update.callCount, 'instance.update called' );
		},

		'test _onTaskDone': function() {
			var instance = new Aggregator( this.editor, '' );

			instance.update = sinon.spy();

			instance._onTaskDone();

			assert.areSame( 1, instance._doneTasks, '_doneTasks was not incremented' );
			assert.areSame( 1, instance.update.callCount, 'instance.update call count' );
		}
	} );

} )();