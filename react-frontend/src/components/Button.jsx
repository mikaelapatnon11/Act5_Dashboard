
function Button() {
  const handleClick = () => {
    alert("Welcome to React");
  };

  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  );
}

export default Button;
