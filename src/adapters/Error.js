export default function (error) {
  return isError(error)
    ? {
        statusText: error?.response?.statusText,
        status: error?.response?.status,
        message: error?.response?.data?.message,
      }
    : null;
}

function isError(obj){
  return Object.prototype.toString.call(obj) === "[object Error]";
}