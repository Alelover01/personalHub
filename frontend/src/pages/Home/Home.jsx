import Header from "../../components/Header/Header";
import Calendar from '../../components/Calendar/Calendar';
import Todo from "../../components/Todo/Todo";
import './Home.css'
export default function Home() {
  return (
    <div className="container">
      <Header />
      <main>
        <div className="content">
          <Calendar />
          <Todo />
        </div>
      </main>
      <section>
        <h2>Chaos' Post-It</h2>
      </section>
    </div>
  );
}
