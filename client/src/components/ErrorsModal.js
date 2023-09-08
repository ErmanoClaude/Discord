export default function ErrorModal ({ show, onClose }) {
    if(!show) return null;

    return (
      <div className="modal">
        <div>Modal Content</div>
        <button onClick={onClose}>Close</button>
      </div>
    )
}