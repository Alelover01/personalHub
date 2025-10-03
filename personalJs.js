(()=>{
    //Mostrare data odierna automaticamente
    const todayDate = document.getElementById('today');
    const optDate = {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'};
    todayDate.textContent = new Date().toLocaleDateString('it-IT', optDate);
})()