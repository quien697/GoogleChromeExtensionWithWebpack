import './Content.css';
import { User } from 'firebase/auth';
import { IssueProps } from '../interface';

interface Props {
  user: User;
  issues: IssueProps[];
}

const Content: React.FC<Props> = ({ user, issues }) => {
  const handleCloseWindow = () => {
    const componentContainer = document.getElementById('popup-windows');
    if (componentContainer) {
      componentContainer.remove();
    }
  };

  return (
    <div className="content-container">
      <div className="content">
        <div className="header">
          <h3>Grab Issues From Jira</h3>
          <button onClick={handleCloseWindow}>close</button>
        </div>
        <div className="user">
          <p>User: {user ? user.email : ""}</p>
        </div>
        <div className="issues">
          {issues.length === 0
          ? <div>
              <p>DATA NOT FOUND</p>
              <p>Please check if you are in Jira page and select Board section. Or any data in To Do list.</p>
            </div>
          : <ul>
              {issues.map(item => (
                <li key={item.id}>{`${item.id} - ${item.title}`}</li>
              ))}
            </ul>
          }
         </div>
      </div>
    </div>
  );
}

export default Content;
