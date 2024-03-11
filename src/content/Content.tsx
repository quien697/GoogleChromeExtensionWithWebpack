import './Content.css';

interface Issue {
  id: string;
  title: string;
}

interface Props {
  data: Issue[];
}

const Content: React.FC<Props> = ({ data }) => {
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
            {data.map(item => (
              <li id="issues" key={item.id}>{`${item.id} - ${item.title}`}</li>
            ))}
          </ul>
         </div>
      </div>
    </div>
  );
}

export default Content;
