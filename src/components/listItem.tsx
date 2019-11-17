import React, {Component} from 'react';

interface todoItem {
    id: number,
    content: string,
    completed: boolean
}

interface Props {
    item: todoItem,
    index: number,
    updateComplete: (index: number, checked: boolean) => void,
    deleteTodo: (index: number) => void,
}

class ListItem extends Component<Props> {
    // 切换单个todo的完成状态
    toggleCompleted: ((event: React.ChangeEvent<HTMLInputElement>) => void) = (event) => {
        const {updateComplete, index} = this.props
        updateComplete(index, event.target.checked)
    }
    // 点击删除单个todo
    handleDestroy = () => {
        const {index, deleteTodo} = this.props
        deleteTodo(index)
    }

    render() {
        const {item} = this.props
        return (
            <li className={item.completed ? "completed" : undefined} key={item.id}>
                <div className="view">
                    <input className="toggle" type="checkbox"
                           checked={item.completed}
                           onChange={this.toggleCompleted}
                    />
                    <label>{item.content}</label>
                    <button className="destroy" onClick={this.handleDestroy}/>
                </div>
                <input className="edit" value="Create a TodoMVC template"/>
            </li>
        );
    }
}

export default ListItem;