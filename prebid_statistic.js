const popupStatisticStyle = `
width: 100px; 
height: 100px;  
border-radius: 50%; 
background-color: white; 
border: 3px solid rgb(217, 127, 27); 
position: fixed; 
bottom: 100px; 
right: 30px; 
font - size: 16px;`;

const tableStyle = `
width:100%;
border-collapse: collapse;`; 

const divWithFrameStyle = `
width: 80%;
height:500px;
visibility: hidden;
background-color: white; 
border: 3px solid rgb(217, 127, 27); 
position:fixed; 
left:10%; 
top: 100px;`;


const wireframeStyle = `
width:100%;
height:80%`;

const closeButtonStyle = `
width: 20%; 
height: 30px; 
background-color: white; 
border: 3px solid rgb(217, 127, 27); 
margin-bottom: 10px; 
margin-top: 6px; 
margin-left: 40%; 
font-size: 16px;`;

const cellStyle = `
border: 2px solid rgb(217, 127, 27);`;

const SlotTableCaption = '<caption><h2>The initial configuration of the slots on the page</h2></caption>';
const NameColSlotTable = ["Name of ad unit", "Sizes", "Bidders", "Ad unit path"]

const BiddersTableCaption = '<caption><h2>The initial configuration of the slots on the page</h2></caption>';
const NameColBiddersTable = ["Bidder name", "CPM", "Currency", "Size"]

const WireframeClassName = "wireframe";
const DivWithFrameClassName = "div_with_wireframe";
const closeButtonHtml = "<strong>Close</strong>";

class Table {
    constructor(caption, style) {
      this.caption = caption;
      this.style = style
      this.table;   
    }

    createTable(){
        this.table = document.createElement('table');
        this.table.className = this.className;
        this.table.style = this.style;
        this.table.innerHTML = this.caption;
    }

    addTableToFrame(frameClassNAme){
        let iframe_doc = document.getElementsByClassName(frameClassNAme)[0].contentDocument;
        iframe_doc.body.append(this.table);
    }

    addRowToTable(rowData){ 
        let row = this.table.insertRow();
        for(let i = 0 ; i < rowData.length; i++){
            let cell = row.insertCell();
            cell.innerHTML = rowData[i];
            cell.style = cellStyle;
    
        }
    }

}


class Div{
    constructor(className, style){
        this.div;
        this.className = className;
        this.style = style;
        this.iframe;
        this.button;
    }

    createDiv(){
        this.div = document.createElement('div');
        this.div.className = this.className;
        this.div.style = this.style;
    }

    addDivToPage(){
        document.body.append(this.div);
    }

    addFrameToDiv(frameClassName, frameStyle){
        this.iframe = document.createElement('iframe');
        this.iframe.className = frameClassName;
        this.iframe.style = frameStyle;
        this.div.append(this.iframe);
    }

    addButtonToDiv(closeButtonHtml, closeButtonStyle, closeStatisticWindow){
        this.button = document.createElement('button');
        this.button.innerHTML = closeButtonHtml;
        this.button.style = closeButtonStyle;
        this.button.onclick = closeStatisticWindow;
        this.div.append(this.button);
    }
}

function formatSizes(banner_sizes) { 
    return banner_sizes.map(([height, width]) => `[${height}, ${width}]`).join(', ') + ';';
}

function formatBidders(bids) {
    return bids.map((bid) => `${bid.bidder}`).join(', ') + ';';

}

function findAdUnitPath(slots, adUnitCode) {
    for (let i = 0; i < slots.length; i++){
        if (slots[i].getSlotId().getDomId() !== adUnitCode) continue
        return slots[i].getSlotId().getAdUnitPath();
    }
}


function getFormatedDataForBiddersTable(winningBids, noBids){
    let bidders = [];
    winningBids.map(win => 
        (bidders.push({name: win.bidder,  
        cpm: win.cpm, 
        curency: win.currency, 
        size: win.size})));

    function forEach(responses, cb) {
              Object.keys(responses).forEach(function(adUnitCode) {
                var response = responses[adUnitCode];
                response.bids.forEach(function(bid) {
                  cb(bid);
                });
              });
            }

    forEach(noBids || {}, function(bid) {
        bidders.push({
          name: bid.bidder, 
          cpm: "-", 
          curency: "-", 
          size: formatSizes(bid.sizes) 
        });
      });

    return bidders;  
}

function getFormatedDataForSlotTable(adUnits, googletagSlots){
    return adUnits.map(adUnit => 
        ({code:adUnit.code,  
        size: formatSizes(adUnit.mediaTypes.banner?.sizes || [adUnit.mediaTypes.video.playerSize]), 
        bidders: formatBidders(adUnit.bids), 
        unitPath:findAdUnitPath(googletagSlots, adUnit.code)}))
}

function visebleFrameAndRerenderData() { 
    let divWithWireframe = document.getElementsByClassName(DivWithFrameClassName)[0];
    divWithWireframe.style.visibility = "visible";

    let slots = googletag.pubads().getSlots();
    let adUnits = pbjs.adUnits
    let winningBids = pbjs.getAllWinningBids();
    let noBids = pbjs.getNoBids();


    let slotTable = new Table(SlotTableCaption, tableStyle);
    slotTable.createTable();
    slotTable.addTableToFrame(WireframeClassName);
    const slotData = getFormatedDataForSlotTable(adUnits, slots);

    slotTable.addRowToTable( NameColSlotTable);
    slotData.forEach(rowData => {
        slotTable.addRowToTable([rowData.code, rowData.size, rowData.bidders, rowData.unitPath]);
    });

    let bidderTable = new Table(BiddersTableCaption, tableStyle);
    bidderTable.createTable();
    bidderTable.addTableToFrame(WireframeClassName);
    const bidderData = getFormatedDataForBiddersTable(winningBids, noBids);

    bidderTable.addRowToTable(NameColBiddersTable);
    bidderData.forEach(rowData=>{
        bidderTable.addRowToTable([rowData.name, rowData.cpm, rowData.curency, rowData.size]);
    })
}


function removeIframeContent(wireframeClass){
    let iframeDoc = document.getElementsByClassName(wireframeClass)[0].contentDocument;
    for(let i = iframeDoc.body.children.length-1; i>=0 ; i --){
        iframeDoc.body.children[i].remove();
    }
}

function closeStatisticWindow() { 
    let divWithWireframe = document.getElementsByClassName(DivWithFrameClassName)[0];
    divWithWireframe.style.visibility = "hidden";
    removeIframeContent(WireframeClassName);
}

function addPopupButtom() {
    let popupPrebidJsStatistic = document.createElement('button');
    popupPrebidJsStatistic.innerHTML = "<strong>Show popup</strong>";
    popupPrebidJsStatistic.style = popupStatisticStyle;
    popupPrebidJsStatistic.onclick = visebleFrameAndRerenderData;
    document.body.append(popupPrebidJsStatistic);
}

function pageLoad(){
    let div = new Div(DivWithFrameClassName, divWithFrameStyle);
    div.createDiv();
    div.addDivToPage();

    div.addFrameToDiv(WireframeClassName, wireframeStyle);
    div.addButtonToDiv(closeButtonHtml, closeButtonStyle, closeStatisticWindow)

    addPopupButtom();
}

pageLoad()

const windowFetch = Object.getOwnPropertyDescriptor(window, 'fetch').value;
Object.defineProperty(window, 'fetch', {
    value: async (url, ...args) => {
        await windowFetch('http://localhost:3000/url', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ url:url })
        });
        await windowFetch(url, ...args);
    }
});  

