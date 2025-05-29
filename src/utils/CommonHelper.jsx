
export const getBaseUrl = async () => {
  return "https://unis-server.vercel.app/api/";
};

export const getRole = async () => {
  const role = localStorage.getItem("role");
  return role ? role : "";
};

export function handleRightClick(event) {
  event.preventDefault();
}

export function getSpinner() {
  return <div className='flex items-center justify-center rounded-lg shadow-lg'>
    <img width={340} className='flex p-7 items-center justify-center rounded-lg shadow-lg' src="/spinner.gif" />
  </div>
}

