import React, {Component} from 'react';

interface todoItem {
    id: number,
    content: string,
    completed: boolean
}

interface Props {
    item: todoItem,
    updateComplete: (item: todoItem, checked: boolean) => void,
    deleteTodo: (item: todoItem) => void,
    updateTodoContent: (value: string, item: todoItem) => void,
}

interface State {
    editing: boolean,
    content: string
}

class ListItem extends Component<Props, State> {
    state: State = {
        editing: false,
        content: ''
    }
    // 切换单个todo的完成状态
    toggleCompleted: ((event: React.ChangeEvent<HTMLInputElement>) => void) = (event) => {
        const {updateComplete, item} = this.props
        updateComplete(item, event.target.checked)
    }
    // 点击删除单个todo
    handleDestroy = () => {
        const {item, deleteTodo} = this.props
        deleteTodo(item)
    }
    // 双击切换编辑状态
    toggleEditing = () => {
        const {editing} = this.state
        this.setState({editing: !editing})
    }
    // editingInput ref
    editingInput: React.RefObject<HTMLInputElement> = React.createRef()

    // 组件更新时，input上前，自动 focus
    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        const {editing} = prevState
        if (!editing) {
            // TS2531: Object is possibly 'null'.
            // 使用 && 或者 turn off strictNullChecks
            this.editingInput.current && this.editingInput.current.focus()
        }
    }

    // blur 时退出editing 状态
    handleBlur = () => {
        this.setState({editing: false})
        // 更新content，如果为空则删除
        const {content} = this.state
        const contentTrim = content.trim()
        if (!contentTrim) { // 为空 删除
            this.handleDestroy()
        } else { // 更新
            const {item, updateTodoContent} = this.props
            updateTodoContent(contentTrim, item)
        }

    }
    // 挂载后同步 input value(content) 和 item.content
    // 抽离 syncContent
    syncContent = () => {
        const {item} = this.props
        this.setState({content: item.content})
    }

    componentDidMount(): void {
        this.syncContent()
    }

    // 收集 input 数据
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void = (event) => {
        this.setState({content: event.target.value})
    }
    // 回车 保存 editing；逻辑同 handleBlur
    handleKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void = (event) => {
        if (event.keyCode === 13) {
            this.handleBlur()
        } else if (event.keyCode === 27) { // 按esc退出编辑并恢复数据
            this.setState({editing: false})
            this.syncContent()
        }
    }

    render() {
        const {item} = this.props
        const {editing, content} = this.state
        return (
            <li className={`${item.completed ? "completed" : undefined} ${editing ? "editing" : undefined} `}
                key={item.id}>
                <div className="view">
                    <input className="toggle" type="checkbox"
                           checked={item.completed}
                           onChange={this.toggleCompleted}
                    />
                    <label onDoubleClick={this.toggleEditing}>{item.content}</label>
                    <button className="destroy" onClick={this.handleDestroy}/>
                </div>
                <input className="edit"
                       value={content}
                       ref={this.editingInput}
                       onBlur={this.handleBlur}
                       onChange={this.handleChange}
                       onKeyUp={this.handleKeyUp}
                />
            </li>
        );
    }
}

export default ListItem;