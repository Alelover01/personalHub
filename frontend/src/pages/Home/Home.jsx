import Header from "../../components/Header/Header";
import Calendar from '../../components/Calendar/Calendar';
import Todo from "../../components/Todo/Todo";
import PostItBoard from "../../components/Postit/Postit";
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
        <PostItBoard />
      </section>
    </div>
  );
}
