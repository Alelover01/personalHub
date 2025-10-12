import Header from "../../components/Header/Header";
import Calendar from '../../components/Calendar/Calendar';
import './Home.css'
export default function Home() {
  return (
    <div className="container">
      <Header />
      <main>
        <div className="content">
          <Calendar />
        </div>
      </main>
      {/**
      Qui c'è anche il main con il calendario e tutto
       */}
    </div>
  );
}
