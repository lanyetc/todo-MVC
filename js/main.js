var $ = function (sel) {
  return document.querySelector(sel);
}
var $All = function (sel) {
  return document.querySelectorAll(sel);
}

// transfer an list to array
var makeArray = function(likeArray) {
  var array = [];
  for (var i = 0; i < likeArray.length; ++i) {
    array.push(likeArray[i]);
  }
  return array;
};

// prevent tap on parent element
Hammer = propagating(Hammer);

// define the state class names
var CL_SELECTED = 'selected';  // if the selector is selected
var CL_COMPLETED = 'completed'; // if the todo item is completed
var CL_EDITING = 'editing'; // if we are editing an exist todo item

// our operation on the edit box
var OP_ADD = 'add'; // adding a new item
var OP_EDIT = 'edit'; // editing an exist item
var operation, todoID, edIndex; // operation; the id of added todo item; the index of item to be edited in the model.data.todos array

// update the todo list whenever some change happened
function update() {
  model.flush();
  var data = model.data;

  var todoList = $('.ul-todo-list');
  todoList.innerHTML = '';
  var leftNum = 0; // the number of items needs to be done

  // for each todo item in localStorage
  data.todos.forEach(function (value, index) {
    if(!value.completed) // if the item is completed
      leftNum++;

    // display todo items according to current selector
    if(data.selector == 'ALL'
      || (data.selector == 'ACTIVE' && !value.completed)
      || (data.selector == 'COMPLETED' && value.completed)){
      var todo = document.createElement('li');
      var id = 'todo' + todoID++;
      todo.setAttribute('id',id);
      if(value.completed)
        todo.classList.add(CL_COMPLETED);
      todo.innerHTML = [
        '<div class="todo-item">',
        ' <input class="toggle" type="checkbox">',
        ' <label class="todo-item-title">' + value.todoTitle + '</label>',
        ' <label class="todo-item-data">' + value.todoData + '</label>',
        ' <button class="destroy"></button>',
        '</div>'
      ].join('');

      // press the item to display the destroy btn
      var todoHammer = new Hammer(todo);
      todoHammer.on('press',function () {
        todo.querySelector('.destroy').style.display = 'block';
      });

      // tap the item to hidden the destroy btn
      todoHammer.on('tap',function () {
        todo.querySelector('.destroy').style.display = 'none';
      });

      // tap the item's title to edit the content of it
      var labelHammer = new Hammer(todo.querySelector('.todo-item-title'));
      labelHammer.on('tap',function () {
        var editor = $('.div-edit');
        var box = $('#box');
        editor.style.display = 'block';
        box.style.display = 'block';
        edIndex = index;
        operation = OP_EDIT;
        todo.classList.add(CL_EDITING);
        console.log(todo);
        var newTitle = editor.querySelector('.input-title');
        var newData = editor.querySelector('#data-selector');
        newTitle.value = (todo.querySelector('label.todo-item-title')).innerHTML;
        newData.value = (todo.querySelector('label.todo-item-data')).innerHTML;
      },false);

      // toggle btn change event
      var todoToggle = todo.querySelector('.toggle');
      todoToggle.checked = value.completed;
      todoToggle.addEventListener('change',function () {
        value.completed = !value.completed;
        update();
      },false);

      // tap the destroy btn to remove the item from localStorage
      var removeHammer = new Hammer(todo.querySelector('.destroy'));
      removeHammer.on('tap', function () {
        data.todos.splice(index,1);
        update();
      },false);

      todoList.insertBefore(todo,todoList.firstChild);
    }
  });

  var counter = $('p.left-item-counter');
  counter.innerHTML = (leftNum || "No ") + (leftNum > 1 ? ' Items ' : 'Item ') + 'Todo';

  // add the "selected" class to the current selector
  var selectors = makeArray($All('.selectors li a'));
  selectors.forEach(function (selector) {
    if(data.selector == selector.innerHTML)
      selector.classList.add(CL_SELECTED);
    else
      selector.classList.remove(CL_SELECTED);
  });
}

// init event
window.onload = function init() {

  // menu tap event
  var menuHammer = new Hammer($('.div-title-img img'));
  var menu = $('.div-title-menu-box');
  var box = $('#box');
  menuHammer.on('tap',function (event) {
     event.stopPropagation();
     event.preventDefault();
    if(menu.style.display != 'block'){
      menu.style.display = 'block';
      box.style.display = 'block';
    }
    else{
      menu.style.display = 'none';
      box.style.display = 'none';
    }
  });
  var boxHammer = new Hammer($('#box'));
  boxHammer.on('tap',function () {
    $('.div-title-menu-box').style.display = 'none';
    if($('.div-edit').style.display != 'block')
      $('#box').style.display = 'none';
  });

  // add botton event
  // show edit box
   var editorHammer = new Hammer($('.ul-title-list li.add'));
  editorHammer.on('tap',function (event) {
      event.stopPropagation();
     var editor = $('.div-edit');
     var box = $('#box');
     if(editor.style.display != 'block'){
       $('.div-title-menu-box').style.display = 'none';
       editor.style.display = 'block';
       box.style.display = 'block';
     }
     else{
       editor.style.display = 'none';
       box.style.display = 'none';
     }
     operation = OP_ADD;
   });

  // cancel button event
  // close edit box
  var cancelHammer = new Hammer($('button.btn-close'));
  cancelHammer.on('tap',function () {
    $('.div-edit').style.display = 'none';
    $('#box').style.display = 'none';
  },false);

  model.init(function () {
    var data = model.data;

    // remove completed button event
    var removeAllHammer = new Hammer($('.ul-title-list li.remove'));
    removeAllHammer.on('tap',function () {
      data.todos.forEach(function (todo, index) {
        if(todo.completed )
          data.todos.splice(index,1);
      });
      data.todos.forEach(function (todo, index) {
        if(todo.completed )
          data.todos.splice(index,1);
      });
      update();
      menu.style.display = 'none';
      box.style.display = 'none';
    },false);

    // toggle all button event
    var toggleAll = $('.ul-title-list li.toggle-all')
    var toggleAllHammer = new Hammer(toggleAll);
    toggleAllHammer.on('tap',function () {
      data.todos.forEach(function (todo) {
        todo.completed = true;
      });
      update();
      menu.style.display = 'none';
      box.style.display = 'none';
    },false);

    // confirm buttom event
    var confirmbtn = $('button.btn-edit');
    confirmbtn.addEventListener('change',function () {
      model.flush();
    });
    var confirmHammer = new Hammer($('button.btn-edit'));
    confirmHammer.on('tap',function () {
      var newTitle = $('.div-edit-title input.input-title');
      var newDate = $('#data-selector');
      if(newTitle.value == '' || newDate.value == ''){
        console.warn('Title or Data is empty');
        return;
      }
      if(operation == OP_ADD)
      {
        data.todoTitle = newTitle.value;
        data.todoData = newDate.value;
        data.todos.push({todoTitle: data.todoTitle, todoData:data.todoData, completed:false});
      }
      else if(operation == OP_EDIT){
        var editingTodo = $('.editing');
        editingTodo.querySelector('label.todo-item-title').innerHTML = newTitle.value;
        editingTodo.querySelector('label.todo-item-data').innerHTML = newDate.value;
        editingTodo.classList.remove(CL_EDITING);
        data.todos[edIndex].todoTitle = newTitle.value;
        data.todos[edIndex].todoData = newDate.value;
      }
      newTitle.value = '';
      newDate.value = '';
      $('.div-edit').style.display = 'none';
      $('#box').style.display = 'none';
      update();
    },false);

    var selectors = makeArray($All('.ul-select-list li a'));
    selectors.forEach(function (selector) {
      var selectorHammer = new Hammer(selector);
      selectorHammer.on('tap',function () {
        data.selector = selector.innerHTML;
        selectors.forEach(function (selector) {
          selector.classList.remove(CL_SELECTED);
        });
        selector.classList.add(CL_SELECTED);
        update();
      },false);
    });

    update();
  })
};

