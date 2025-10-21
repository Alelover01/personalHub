export const postItTemplates ={
   Travel:{
    fields:[
        {name: 'title', label: 'Place', type: 'text'},
        {name: 'imageUrl', label: 'Image of the place', type: 'text'},
        {name: 'country', label: 'Nation', type: 'text'},
        {name: 'description', label: 'Description', type: 'textarea'},
    ],
   },
   Finance: {
    fields: [
        {name: 'title', label: 'Name of the cost', type: 'text'},
        {name: 'amount', label: 'How much', type: 'number', min: 0, max: 999999999, step: 0.01,},
        {name: 'type', label: 'Cost or Revenue', type: 'select', options: ['Revenue','Cost'],},
        {name: 'category', label: 'Category', type: 'select', options: ['Food','Transport','Pleasure','Work','Other'],},
        {name: 'description', label: 'Description', type: 'textarea'},
    ],
   },
   Books: {
    fields: [
        {name: 'title', label: 'Title of the book', type: 'text'},
        {name: 'imageUrl', label: 'Image of the cover', type: 'text'},
        {name: 'author', label: 'Name of the author', type: 'text'},
        {name: 'status', label: 'Status', type: 'select', options: ['Idk', 'Read', 'To Read', 'Dropped'],},
        {name: 'series', label: 'Part of a series', type: 'select', options: ['Yes', 'No'],},
        {name: 'nameSeries', label: 'Name of the Series', type: 'text',conditionalOn: { field: 'series', value: 'Yes'}},
        {name: 'number series', label: 'Number of the Series', type: 'text',conditionalOn: { field: 'series', value: 'Yes'}},
        {name: 'mark', label:'Your Mark', type: 'number', min: 0, max: 5, conditionalOn: {field: 'status', value: ['Read', 'Dropped']}},
        {name: 'review', label: 'Review of the book', type: 'textarea', conditionalOn: {field: 'status', value: ['Read', 'Dropped']}},
    ]
   },
   Series:{
    fields:[
        {name: 'title', label:'Title of the Tv-Series', type: 'text'},
        {name: 'imageUrl', label: 'Image of the Series', type: 'text'},
        {name: 'type', label: 'Type of Series', type: 'select', options: ['C-Drama', 'K-Drama', 'J-Drama', 'Western', 'Other'],},
        {name: 'status', label: 'Status', type: 'select', options: ['Watched', 'Waiting', 'Watching', 'Dropped'],},
        {name: 'mark', label:'Your Mark', type: 'number', min: 0, max: 5,conditionalOn: {field: 'status', value: ['Watched', 'Dropped', 'Watching']}},
        {name: 'review', label: 'Review of the series', type: 'textarea',conditionalOn: {field: 'status', value: ['Watched', 'Dropped', 'Watching']}},
    ]
   },
   Anime: {
    fields:[
        {name: 'title', label:'Title of the Anime', type: 'text'},
        {name: 'imageUrl', label: 'Image of the Anime', type: 'text'},
        {name: 'status', label: 'Status', type: 'select', options: ['Watched', 'Waiting', 'Watching', 'Dropped'],},
        {name: 'mark', label:'Your Mark', type: 'number', min: 0, max: 5,conditionalOn: {field: 'status', value: ['Watched', 'Dropped', 'Watching']}},
        {name: 'review', label: 'Review of the series', type: 'textarea',conditionalOn: {field: 'status', value: ['Watched', 'Dropped', 'Watching']}},
    ]
   },
   Manhwa: {
    fields: [
        {name: 'title', label: 'Title of the Manhwa', type: 'text'},
        {name: 'imageUrl', label: 'Image of the Manhwa', type: 'text'},
        {name: 'status', label: 'Status', type: 'select', options: ['Idk', 'Read', 'To Read', 'Dropped'],},
        {name: 'mark', label:'Your Mark', type: 'number', min: 0, max: 5, conditionalOn: {field: 'status', value: ['Read', 'Dropped']}},
        {name: 'review', label: 'Review of the book', type: 'textarea', conditionalOn: {field: 'status', value: ['Read', 'Dropped']}},
    ]
   },
   Games: {
    fields:[
        {name: 'title', label:'Name of the Game', type: 'text'},
        {name: 'imageUrl', label: 'Image of the Game', type: 'text'},
        {name: 'amount', label: 'Cost of the Game', type: 'number', min: 0, max: 999999999, step: 0.01,},
        {name: 'type', label: 'Type of Game', type: 'select', options: ['Co-Op', 'Singleplayer', 'Multiplayer'],},
        {name: 'status', label: 'Status', type: 'select', options: ['Played', 'Yet To Play','Playing','Dropped'],},
        {name: 'mark', label:'Your Mark', type: 'number', min: 0, max: 5,conditionalOn: {field: 'status', value: ['Played', 'Dropped', 'Playing']}},
        {name: 'review', label: 'Review of the game', type: 'textarea',conditionalOn: {field: 'status', value: ['Played', 'Dropped', 'Playing']}},
    ]
   },
   Sites:{
    fields:[
        {name: 'title', label:'Name of the Site', type: 'text'},
        {name: 'description', label: 'Description', type: 'textarea'},
        {name: 'link', label: 'Link to the site', type: 'text'},
    ]
   }
};