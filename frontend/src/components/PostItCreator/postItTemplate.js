export const postItTemplates ={
   Travel:{
    fields:[
        {name: 'title', label: 'Titolo', type: 'text'},
        {name: 'imageUrl', label: 'Immagine', type: 'text'},
        {name: 'country', label: 'Nazione', type: 'text'},
        {name: 'description', label: 'Descrizione', type: 'textarea'},
    ],
   },
   Finance: {
    fields: [
        {name: 'title', label: 'Titolo', type: 'text'},
        {name: 'amount', label: 'Costo', type: 'number'},
        {name: 'type', label: 'Tipo', type: 'select', options: ['Ricavo','Spesa'],},
        {name: 'category', label: 'Categoria', type: 'select', options: ['Cibo','Trasporti','Piacere','Lavoro','Altro'],},
        {name: 'description', label: 'Descrizione', type: 'textarea'},
    ],
   },
};