import React, { useReducer, useState } from 'react';

const initialState = {
    todos: [],
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                todos: [...state.todos, action.payload],
            };
        case 'REMOVE_TODO':
            return {
                todos: state.todos.filter(todo => todo.id !== action.payload),
            };
        default:
            return state;
    }
};

const TodoApp = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [newTodo, setNewTodo] = useState('');

    const handleAddTodo = () => {
        if (newTodo.trim()) {
            const todo = {
                id: Date.now(),
                text: newTodo,
            };

            dispatch({ type: 'ADD_TODO', payload: todo });
            setNewTodo('');
        }
    };

    const handleRemoveTodo = id => {
        dispatch({ type: 'REMOVE_TODO', payload: id });
    };

    return (
        <div>
            <input
                type="text"
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
            />
            <button onClick={handleAddTodo}>Add Todo</button>

            <ul>
                {state.todos.map(todo => (
                    <li key={todo.id}>
                        {todo.text}
                        <button onClick={() => handleRemoveTodo(todo.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
