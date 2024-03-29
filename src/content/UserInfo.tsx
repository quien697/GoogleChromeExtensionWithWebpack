import './UserInfo.css';
import { User } from 'firebase/auth';

interface Props {
  user: User;
}

const Content: React.FC<Props> = ({ user }: Props) => {
  const handleCloseWindow = () => {
    const componentContainer = document.getElementById('popup-windows');
    if (componentContainer) {
      componentContainer.remove();
    }
  };

  return (
    <div className="user-info-container">
      <div className="content">
        <div className="header">
          <h3>User Info</h3>
          <button onClick={handleCloseWindow}>close</button>
        </div>
        {user
        ? <div className="user">
            <p>Display Name: {user.displayName}</p>
            <p>Email: {user.email}</p>
          </div>
        : <p>No sing in or has a sing in problem.</p>
        }
      </div>
    </div>
  );
}

export default Content;
