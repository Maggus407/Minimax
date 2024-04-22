import {TabulatorFull as Tabulator} from 'tabulator-tables';
import { useControlTableStore } from '@/store/ControlTableStore';
import { createPinia, setActivePinia } from 'pinia';

const pinia = createPinia(); 
setActivePinia(pinia);

let tabledata = [
    {id:1, name:"Oli Bob", progress:12, gender:"male", rating:1, col:"red" },
    {id:2, name:"Mary May", progress:1, gender:"female", rating:2, col:"blue" },
    {id:3, name:"Christine Lobowski", progress:42, gender:"female", rating:0, col:"green" },
    {id:4, name:"Brendon Philips", progress:100, gender:"male", rating:1, col:"orange" },
    {id:5, name:"Margret Marmajuke", progress:16, gender:"female", rating:5, col:"yellow"},
];

//Build Tabulator
let table = new Tabulator("#table", {
    height:"311px",
    layout:"fitColumns",
    reactiveData:true, //turn on data reactivity
    data:tabledata, //load data into table
    columns:[
        {title:"Name", field:"name", sorter:"string", width:200},
        {title:"Progress", field:"progress", sorter:"number", formatter:"progress"},
        {title:"Gender", field:"gender", sorter:"string"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col", sorter:"string"},
    ],
});

