import "@styles/toppanel.css";

export default function StatsList({ stats }) {
  return (
    <div className="statsContainer">
        {
            stats.map((stat) => (
                <p key={stat.label} className="clickable" onClick={stat.filter}>
                    {stat.label}: {stat.value}
                </p>
            ))
        }
    </div>
  );
}