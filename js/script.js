const getJSON = function(url) {
	return new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();
	
		xhr.open('get', url, true);
	
		xhr.responseType = 'json';
	
		xhr.onload = function() {
			let status = xhr.status;
	
			if (status === 200) {
			resolve(xhr.response);
			} else {
			reject(status);
			}
		};

		xhr.send();
	});
}; 
  
const createOrUpdateJSON = function(url, type, data) {
	return new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open(type, url, true);

		xhr.setRequestHeader(
			'Content-type', 'application/json; charset=utf-8',
		);
	
		xhr.responseType = 'json';
	
		xhr.onload = function() {
	
			resolve(xhr.response);
		};

		xhr.onerror = function() {
			reject("Error fetching " + url);
		};

		xhr.send(data);
	});
};

const deleteJSON = function(url) {
	return new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();

		xhr.open('delete', url, true);

		xhr.setRequestHeader(
			'Content-type', 'application/json; charset=utf-8',
		);
	
		xhr.responseType = 'json';
	
		xhr.onload = function() {
	
			resolve(xhr.response);
		};

		xhr.onerror = function() {
			reject("Error fetching " + url);
		};
		
		xhr.send();
	});
}

class TodoList {
	constructor(el) {
		this.todos = [];
		this.el = el;
		this.el.addEventListener('click', (event) => {
			if(event.target.classList.contains('set-status')) {
				this.changeStatus(event.target.closest('.list-item').dataset.id);
			} else if(event.target.classList.contains('delete-task')) {
				this.removeTodo(event.target.closest('.list-item').dataset.id);
			}
		});
	}
	getTodos() {
		getJSON('http://localhost:3000/todos')
		.then((e) => {
			e.map((el) => {
				this.todos.unshift(el);
			})
			this.render(this.todos);
		})
		.catch((err) => console.log(err));
	}
	addTodo(todo) {
		createOrUpdateJSON('http://localhost:3000/todos','post', JSON.stringify(todo)).catch((err) => console.log(err));
		this.todos.unshift(todo);
		this.render(this.todos);
	}
	removeTodo(id) {
		let index = this.todos.findIndex((el) => el.id === id);
		deleteJSON(`http://localhost:3000/todos/${this.todos[index].id}`).catch((err) => console.log(err));
		this.todos = this.todos.filter((el) => {
			return el.id !== id;
		});
		this.render(this.todos);
	}
	changeStatus(id) {
		let index = this.todos.findIndex((el) => el.id === id);
		this.todos[index].status = !this.todos[index].status;
		createOrUpdateJSON(`http://localhost:3000/todos/${this.todos[index].id}`, 'PUT', JSON.stringify({
			"value": this.todos[index].value,
			"status": this.todos[index].status ? true : false,
			"id": this.todos[index].id
		 })).catch((err) => console.log(err));
		this.render(this.todos);

	}
	render(todos = []) {
		let lis = '';
		for (let el of todos) {
			if (!el) {
			return;
		}
		lis += `<li class="list-item ${el.status ? 'list-item-done' : ''}" data-id="${el.id}"><span>${el.value}</span><button class="set-status">Change status</button><button class="delete-task">Delete</button></li>`;
	  	}
	  	this.el.innerHTML = lis;
	}
	findTasks(value) {
      this.render(
          this.todos.filter(item => item.value.includes(value))
      );
  	}
}

class Task {
	constructor(value) {
		this.value = value;
		this.status = false;
		this.id = Math.random().toString(36).substring(2, 9);
	}
}

const form = document.querySelector('.form');
const list = document.querySelector('#list');
const taskText = document.querySelector('.task-text');
const todo1 = new TodoList(list);

form.addEventListener('click', (event) => {
	event.preventDefault();
	if(event.target.classList.contains('add-task')) {
		todo1.addTodo(new Task(taskText.value));
		taskText.value = '';
	} else if(event.target.classList.contains('find-task')) {
		todo1.findTasks(taskText.value);
	}
})

document.addEventListener('load', todo1.getTodos());