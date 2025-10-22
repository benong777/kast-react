import TodoList from './features/TodoList/TodoList';
import TodoForm from './features/TodoForm';
import TodosViewForm from './features/TodosViewForm';
import { StyledButton } from './components/styles/Button.styles';

const TodosPage = ({
  todoList,
  isSaving,
  isLoading,
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
  queryString,
  setQueryString,
  addTodo,
  completeTodo,
  updateTodo,
  onPreviousPage,
  onNextPage,
  currentPage,
  totalPages,
}) => {

  return (
    <>
      <div className='app-columns'>
        <div id='menu-column'>
          <TodosViewForm 
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            sortField={sortField}
            setSortField={setSortField}
            queryString={queryString}
            setQueryString={setQueryString}
          />
        </div>
        <div id='content-column'>
          <TodoForm onAddTodo={addTodo} isSaving={isSaving} />
          <TodoList
            todoList={todoList}
            onCompleteTodo={completeTodo}
            onUpdateTodo={updateTodo}
            isLoading={isLoading}
          />
          <div className='paginationControls' style={{ padding: 16 }}>
            <StyledButton type='button' disabled={currentPage===1} onClick={onPreviousPage}>{'< Previous'}</StyledButton>
            <span style={{ marginLeft: 16, marginRight: 16 }}>Page {currentPage} of {totalPages}</span>
            <StyledButton type='button' disabled={currentPage===totalPages} onClick={onNextPage}>{'Next >'}</StyledButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default TodosPage;