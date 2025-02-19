export function Card({ children }) {
    return <div className="bg-white shadow-md p-4 rounded-lg">{children}</div>;
  }
  
  export function CardContent({ children }) {
    return <div>{children}</div>;
  }
  