/// <reference path='./director.d.ts' />
// App组件
import React, {Component} from 'react'
import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import {Router} from "director/build/director.min";


import ListItem from './components/listItem';

interface todoItem {
    id: number,
    content: string,
    completed: boolean
}

interface State {
    list: todoItem[],
    newTodo: string,
    allChecked: boolean,
    currentHash: string
}

interface Props {

}

export default class App extends Component<Props, State> {
    readonly state: State = {
        list: [
            {
                id: 1,
                content: 'xxx',
                completed: true
            },
            {
                id: 2,
                content: 'yyy',
                completed: true
            },
        ],
        newTodo: '',
        allChecked: false,
        currentHash: '/'
    }
    // DidMount生命周期和所有修改list的情况都有检查allChecked是否满足
    queryAllChecked: (list: todoItem[]) => void = (list) => {
        let allChecked = true
        for (let i = 0; i < list.length; i++) {
            if (!list[i].completed) {
                allChecked = false
                break
            }
        }
        this.setState({allChecked})
    }

    componentDidMount(): void {
        const {list} = this.state
        this.queryAllChecked(list)

        // 从localStorage 读取 list
        const localList = JSON.parse(localStorage.getItem('list') === null ? '[]' : localStorage.getItem('list') as string)
        this.setState({list: localList})

        // router
        const router = new Router()
        ;['/', '/active', '/completed'].forEach((item) => {
            router.on(item, () => {
                this.setState({currentHash: item})
            })
        })
        router.configure({
            notfound: () => {
                window.location.hash = '/'
                // this.setState({currentHash: '/'}) 这行不需要
            }
        })
        router.init()
    }

    // 封装localStorage.setItem()
    localStorageSetItem: (list: todoItem[]) => void = (list) => {
        localStorage.setItem('list', JSON.stringify(list))
    }

    // 受控组件方式收集input value
    handleChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) = (event) => {
        this.setState({newTodo: event.target.value});
    }
    // 回车新建item
    handleEnter: ((event: React.KeyboardEvent<HTMLInputElement>) => void) = (event) => {
        if (event.keyCode === 13) {
            const {list, newTodo} = this.state
            // input value 不为空才创建新item
            const content = newTodo.trim()
            if (content) {
                const newList = [...list, {
                    id: list.length ? (list[list.length - 1].id + 1) : 1,
                    content,
                    completed: false
                }]
                this.setState({list: newList})
                this.localStorageSetItem(newList)
                this.queryAllChecked(newList)
                // 清空input
                this.setState({newTodo: ''})
            }
        }
    }
    // 切换所有 todos 完成状态
    toggleAll: ((event: React.ChangeEvent<HTMLInputElement>) => void) = (event) => {
        this.setState({allChecked: event.target.checked})
        const {list} = this.state
        const newList = list.map((item) => {
            return {...item, completed: event.target.checked}
        })
        this.setState({list: newList})
        this.localStorageSetItem(newList)
    }
    // 更新单个todo的完成状态，传递给listItem组件
    updateComplete: (index: number, checked: boolean) => void = (index, checked) => {
        const {list} = this.state
        const newList = list.map((item, i) => {
            return i === index ? {...item, completed: checked} : item
        })
        this.setState({list: newList})
        this.localStorageSetItem(newList)
        // When all the todos are checked it should also get checked.
        this.queryAllChecked(newList)
    }
    // 删除单个todo
    deleteTodo: (index: number) => void = (index) => {
        const {list} = this.state
        const newList = list.filter((item, i) => {
            return index !== i
        })
        this.setState({list: newList})
        this.localStorageSetItem(newList)
        this.queryAllChecked(newList)
    }
    // 更新单个todo content
    updateTodoContent: (value: string, index: number) => void = (value, index) => {
        const {list} = this.state
        const newList = list.map((item, i) => {
            return index === i ? {...item, content: value} : item
        })
        this.setState({list: newList})
        this.localStorageSetItem(newList)
    }
    // clearCompleted
    clearCompleted = () => {
        const {list} = this.state
        const itemsLeft = list.filter((item) => {
            return !item.completed
        })
        this.setState({list: itemsLeft})
        this.localStorageSetItem(itemsLeft)
    }

    render() {
        const {list, newTodo, allChecked, currentHash} = this.state
        const itemsLeft = list.filter((item) => {
            return !item.completed
        })
        let filterList = list
        if (currentHash === '/active') {
            filterList = itemsLeft
        } else if (currentHash === '/completed') {
            filterList = list.filter((item) => {
                return item.completed
            })
        }
        return (
            <>
                <section className="todoapp">
                    <header className="header">
                        <h1>todos</h1>
                        <input className="new-todo" placeholder="What needs to be done?" autoFocus
                               value={newTodo}
                               onChange={this.handleChange}
                               onKeyUp={this.handleEnter}
                        />
                    </header>
                    {list.length ? (
                        <>
                            <section className="main">
                                <input id="toggle-all" className="toggle-all" type="checkbox"
                                       onChange={this.toggleAll} checked={allChecked}/>
                                <label htmlFor="toggle-all">Mark all as complete</label>
                                <ul className="todo-list">
                                    {filterList.map((item, index) => <ListItem
                                        item={item}
                                        index={index}
                                        key={item.id}
                                        updateComplete={this.updateComplete}
                                        deleteTodo={this.deleteTodo}
                                        updateTodoContent={this.updateTodoContent}
                                    />)}
                                </ul>
                            </section>
                            <footer className="footer">
                                <span
                                    className="todo-count"><strong>{itemsLeft.length}</strong> {itemsLeft.length === 1 ? 'item' : 'items'} left</span>
                                <ul className="filters">
                                    <li>
                                        <a className={currentHash === '/' ? "selected" : undefined} href="#/">All</a>
                                    </li>
                                    <li>
                                        <a className={currentHash === '/active' ? "selected" : undefined}
                                           href="#/active">Active</a>
                                    </li>
                                    <li>
                                        <a className={currentHash === '/completed' ? "selected" : undefined}
                                           href="#/completed">Completed</a>
                                    </li>
                                </ul>
                                {list.length === itemsLeft.length ? null :
                                    <button className="clear-completed" onClick={this.clearCompleted}>Clear completed
                                    </button>}
                            </footer>
                        </>
                    ) : null}
                </section>
                <footer className="info">
                    <p>Double-click to edit a todo</p>
                    <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
                    <p>Created by <a href="http://todomvc.com">you</a></p>
                    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
                </footer>
            </>
        )
    }
}