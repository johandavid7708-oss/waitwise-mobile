let updates = JSON.parse(localStorage.getItem("waitwise")) || [];
updates = updates.filter(u => u.restaurant && u.crowd)

function displayUpdates(){

let table = document.getElementById("tableBody")
table.innerHTML=""

let countMap = {}

updates.forEach(update=>{
let key = update.restaurant + update.location
countMap[key] = (countMap[key] || 0) + 1
})

updates.forEach(update=>{

let key = update.restaurant + update.location
let count = countMap[key]

let trend = getTrend(update.restaurant)

let confidence="Low"
function showAvoidPlaces(){

let html=""

updates.slice(0,10).forEach(update=>{

if(update.crowd=="High"){

html+=`
<p>
⚠️ Avoid ${update.restaurant}  
🔴 Busy Right Now
</p>
`

}

})

document.getElementById("avoidBox").innerHTML =
html || "No busy places right now"

}

if(count>=2) confidence="Medium"
if(count>=4) confidence="High"

let row=`
<tr>
<td>${update.restaurant}</td>
<td>${update.location || "-"}</td>
<td class="${update.crowd.toLowerCase()}">${update.crowd}</td>
<td>${confidence}</td>
<td>${getBestTime(update.restaurant)}</td>
<td>${getPeakHours(update.restaurant)}</td>
<td>${trend}</td>
<td>${getCrowdScore(update.restaurant)}</td>
<td>${getTimeAgo(update.time)}</td>
</tr>
`

table.innerHTML += row

})

showPopular()
showBestPlaces()
showSmartSuggestions()
showAlternatives()
showCityCrowd()
showLeaveAlert()
showAreaCrowd()
showAvoidPlaces()
showAreaSuggestions()
showTimePredictions()

}
function addUpdate(){

let restaurant=document.getElementById("restaurant").value
let location=document.getElementById("location").value
let crowd=document.getElementById("crowd").value

if(restaurant=="" || crowd==""){
alert("Please fill all fields")
return
}

let newUpdate={
restaurant:restaurant,
location:location,
crowd:crowd,
time:Date.now()
}

updates.unshift(newUpdate)

localStorage.setItem("waitwise", JSON.stringify(updates))

displayUpdates()

}

displayUpdates()
function searchData(){

let input=document.getElementById("search").value.toLowerCase()
let rows=document.querySelectorAll("#tableBody tr")

rows.forEach(row=>{
let text=row.innerText.toLowerCase()

if(text.includes(input)){
row.style.display=""
}else{
row.style.display="none"
}
})

}
function getTimeAgo(time){

let seconds=Math.floor((Date.now()-time)/1000)

if(seconds<60) return "Just now"

let minutes=Math.floor(seconds/60)

if(minutes<60) return minutes+" min ago"

let hours=Math.floor(minutes/60)

return hours+" hr ago"

}

function getTrend(restaurant){

let filtered = updates
.filter(u => u.restaurant === restaurant)
.slice(0,3)

if(filtered.length < 2) return "Collecting..."

let levels = {
"Low":1,
"Medium":2,
"High":3
}



let first = levels[filtered[0].crowd]
let second = levels[filtered[1].crowd]

if(first > second) return "📈 Rising"

if(first < second) return "📉 Falling"

return "➖ Stable"
  
}
function getBestTime(restaurant){

let filtered = updates.filter(
u => u.restaurant === restaurant
)

if(filtered.length < 3) return "Collecting..."

let lowTimes = []

filtered.forEach(update=>{
if(update.crowd=="Low" && update.time){
lowTimes.push(new Date(update.time))
}
})

if(lowTimes.length < 2) return "Collecting..."

let hours = lowTimes.map(t => t.getHours())

let avgHour = Math.floor(
hours.reduce((a,b)=>a+b,0) / hours.length
)

let start = avgHour
let end = avgHour + 2

return start + ":00 - " + end + ":00"

}

function showPopular(){

let count = {}

updates.forEach(update=>{
count[update.restaurant] = 
(count[update.restaurant] || 0) + 1
})

let sorted = Object.entries(count)
.sort((a,b)=>b[1]-a[1])

let top = sorted.slice(0,3)

let html=""

top.forEach(item=>{
html += `<p>🔥 ${item[0]} (${item[1]} reports)</p>`
})

document.getElementById("popularBox").innerHTML =
html || "Collecting data..."

}
function showBestPlaces(){

let best = updates.filter(
u => u.crowd === "Low"
)

let latest = best.slice(0,3)

let html=""

latest.forEach(place=>{
html += `<p>⭐ ${place.restaurant} — Low Crowd</p>`
})

document.getElementById("bestBox").innerHTML =
html || "No low crowd places now"

}
function showAlternatives(){

let highCrowd = updates.filter(
u => u.crowd === "High"
)

let lowCrowd = updates.filter(
u => u.crowd === "Low"
)

let html = ""

highCrowd.slice(0,2).forEach(place=>{

let alt = lowCrowd[Math.floor(Math.random()*lowCrowd.length)]

if(alt){
html += `
<p>
⚠️ ${place.restaurant} is busy  
👉 Try ${alt.restaurant} instead
</p>
`
}

})

document.getElementById("altBox").innerHTML =
html || "No suggestions yet"

}
function getTrend(restaurant){

let filtered = updates
.filter(u => u.restaurant === restaurant)
.slice(0,3)

if(filtered.length < 2) return "Collecting..."

let levels = {
"Low":1,
"Medium":2,
"High":3
}

let first = levels[filtered[0].crowd]
let second = levels[filtered[1].crowd]

if(first > second) return "📈 Rising"
if(first < second) return "📉 Falling"

return "➖ Stable"
  
}
function getPeakHours(restaurant){

let filtered = updates.filter(
u => u.restaurant === restaurant && u.crowd === "High"
)

if(filtered.length < 2) return "Collecting..."

let hours = filtered.map(
u => new Date(u.time).getHours()
)

let avg = Math.floor(
hours.reduce((a,b)=>a+b,0)/hours.length
)

return avg + ":00 - " + (avg+2) + ":00"

}
function showCityCrowd(){

let areaCount = {}

updates.forEach(update=>{

if(!update.location) return

areaCount[update.location] = 
(areaCount[update.location] || 0) + 1

})

let sorted = Object.entries(areaCount)
.sort((a,b)=>b[1]-a[1])

let top = sorted.slice(0,3)

let html=""

top.forEach(area=>{

let level="Calm"

if(area[1] >= 3) level="Medium"
if(area[1] >= 5) level="Busy"

html += `<p>🌆 ${area[0]} — ${level}</p>`

})

document.getElementById("cityBox").innerHTML =
html || "Collecting area data..."

}
function showLeaveAlert(){

let html=""
let places={}

updates.forEach(update=>{

if(!places[update.restaurant]){
places[update.restaurant]=[]
}

places[update.restaurant].push(update)

})

let levels={
"Low":1,
"Medium":2,
"High":3
}

Object.keys(places).forEach(place=>{

let data=places[place].slice(0,5)

if(data.length<2) return

let growth=0

for(let i=0;i<data.length-1;i++){

growth += levels[data[i].crowd] - levels[data[i+1].crowd]

}

growth = growth/(data.length-1)

let estimate = Math.floor(30/Math.max(0.3,growth))
estimate = Math.min(60, Math.max(10, estimate))

let latest=data[0]

let alertShown=false

// Primary Trend Prediction
if(growth>0.2){

if(latest.crowd=="Medium"){

html+=`
<p>
⚠️ ${place} becoming busy  
⏳ Likely busy in ~${estimate} minutes
</p>
`

alertShown=true

}

}

// Backup Peak Hours Prediction
if(!alertShown){

let peak = getPeakHours(place)

if(peak!="Collecting..."){

let currentHour = new Date().getHours()
let start = parseInt(peak)

let diff = start-currentHour

if(diff>0 && diff<=2){

html+=`
<p>
⚡ ${place} approaching peak hours  
⏳ Likely busy in ~${diff*30} minutes
</p>
`

}

}

}

})

document.getElementById("alertBox").innerHTML =
html || "No alerts now"

}
function showAreaCrowd(){

let areas = {}

updates.forEach(update=>{

if(!update.location) return

if(!areas[update.location]){
areas[update.location] = {
low:0,
medium:0,
high:0
}
}

if(update.crowd=="Low") areas[update.location].low++
if(update.crowd=="Medium") areas[update.location].medium++
if(update.crowd=="High") areas[update.location].high++

})

let html=""

Object.keys(areas).forEach(area=>{

let data = areas[area]

if(data.high >= 2){
html += `<p>🔴 ${area} — Busy Right Now</p>`
}
else if(data.low >= 2){
html += `<p>🟢 ${area} — Free Right Now</p>`
}
else{
html += `<p>🟡 ${area} — Moderate Crowd</p>`
}

})

document.getElementById("areaBox").innerHTML =
html || "Collecting area data..."

}
function getCrowdScore(restaurant){

let filtered = updates
.filter(u => u.restaurant === restaurant)
.slice(0,5)

if(filtered.length < 2) return "Collecting..."

let levels = {
"Low":30,
"Medium":60,
"High":90
}

let scores = filtered.map(
u => levels[u.crowd]
)

let avg = Math.floor(
scores.reduce((a,b)=>a+b,0)/scores.length
)

if(avg <= 40) return "🟢 Calm"
if(avg <= 70) return "🟡 Moderate"

return "🔴 Busy"
function showSmartSuggestions(){

if(updates.length === 0){

document.getElementById("smartSuggest").innerHTML =
"<p>Waiting for data...</p>"

return
}

let lowCrowd = updates.filter(u=>u.crowd=="Low")
let mediumCrowd = updates.filter(u=>u.crowd=="Medium")

let html=""

if(lowCrowd.length>0){

html += "<p>🟢 Best to Visit Now:</p>"

lowCrowd.slice(0,2).forEach(place=>{
html += `<p>• ${place.restaurant}</p>`
})

}

else if(mediumCrowd.length>0){

html += "<p>🟡 Try Soon:</p>"

mediumCrowd.slice(0,2).forEach(place=>{
html += `<p>• ${place.restaurant}</p>`
})

}

else{

html += "<p>🔴 Busy Right Now — Try Later</p>"

}

document.getElementById("smartSuggest").innerHTML = html

}
}

function showAvoidPlaces(){

let busy = updates.filter(u => u.crowd === "High")

if(busy.length === 0){
document.getElementById("avoidBox").innerHTML =
"<h3>⚠️ Avoid These Places</h3><p>No busy places now</p>"
return
}

let html = "<h3>⚠️ Avoid These Places</h3>"

busy.slice(0,3).forEach(place=>{
html += `<p>🔴 ${place.restaurant}</p>`
})

document.getElementById("avoidBox").innerHTML = html

}
function showAreaSuggestions(){

let areas = {}

updates.forEach(update=>{

if(!update.location) return

if(!areas[update.location]){
areas[update.location] = []
}

areas[update.location].push(update)

})

let bestAreas = Object.keys(areas).filter(area=>{
return areas[area].filter(u=>u.crowd=="Low").length >= 1
})

if(bestAreas.length === 0){

document.getElementById("areaSuggestBox").innerHTML =
"<h3>🌆 Best Areas Right Now</h3><p>Collecting data...</p>"

return
}

let html = "<h3>🌆 Best Areas Right Now</h3>"

bestAreas.slice(0,3).forEach(area=>{
html += `<p>🟢 ${area}</p>`
})

document.getElementById("areaSuggestBox").innerHTML = html

}
function showTimePredictions(){

if(updates.length === 0){

document.getElementById("timeBox").innerHTML =
"<h3>⏱️ Time Predictions</h3><p>Collecting data...</p>"

return
}

let html = "<h3>⏱️ Time Predictions</h3>"

updates.slice(0,3).forEach(update=>{

let peak = getPeakHours(update.restaurant)

if(peak){

html += `<p>⚡ ${update.restaurant} — ${peak}</p>`

}

})

document.getElementById("timeBox").innerHTML = html

}