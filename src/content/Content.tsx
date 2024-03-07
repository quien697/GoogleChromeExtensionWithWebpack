import './Content.css';

interface Props {
  msg: string;
}

const Content: React.FC<Props> = ({ msg }) => {
  const handleCloseWindow = () => {
    const componentContainer = document.getElementById('popup-windows');
    if (componentContainer) {
      componentContainer.remove();
    }
  };

  return (
    <div className="content-container">
      <div className="header">
        <h3>Popup Page</h3>
        <button onClick={handleCloseWindow}>close</button>
      </div>
      <div>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default Content;
