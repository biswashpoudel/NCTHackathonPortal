export function Table({ children }) {
    return <table className="w-full border">{children}</table>;
  }
  
  export function TableHead({ children }) {
    return <thead className="bg-gray-200">{children}</thead>;
  }
  
  export function TableRow({ children }) {
    return <tr>{children}</tr>;
  }
  
  export function TableCell({ children }) {
    return <td className="border px-4 py-2">{children}</td>;
  }
  
  export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
  }
  