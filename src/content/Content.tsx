import './Content.css';
import { IssueProps } from '../interface';

interface Props {
  issues: IssueProps[];
}

const Content: React.FC<Props> = ({ issues }) => {
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
          <h3>Popup Page</h3>
          <button onClick={handleCloseWindow}>close</button>
        </div>
        <div className="issues">
          <ul>
            {issues.map(item => (
              <li key={item.id}>{`${item.id} - ${item.title}`}</li>
            ))}
          </ul>
         </div>
      </div>
    </div>
  );
}

export default Content;
