
var trash = document.getElementsByClassName("fa-trash");


Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'msg': msg
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

//Will Move this server side if I can, but AIRBNB is making it hard to make a query directly from the server //
//More Notes in routes.js //
fetch("https://mashvisor-api.p.rapidapi.com/airbnb-property/top-reviewed?page=1&city=Los%20Angeles&reviews_count=30&zip_code=91342&state=CA", {
"method": "GET",
"headers": {
"x-rapidapi-host": "mashvisor-api.p.rapidapi.com",
"x-rapidapi-key": "3ae1d00c97msh298612aebb81230p11684djsn405007844583"
         }
      })
  .then(response => response.json())
  .then(data => {
    console.log("Couldn't get everything into the Server yet, hoping I will figure it out Soon. More Notes in routes.js")
    console.log(data.content.list)
    data.content.list.forEach(x=>{
      let listItem = document.createElement('li')
      let title = document.createElement('h4')
      let titleContent = document.createTextNode(`${x.name}`)
      title.appendChild(titleContent)
      listItem.appendChild(title)
      let address = document.createElement('h6')
      let addressContent = document.createTextNode(`${x.address}  |  ${x.star_rating}`)
      address.appendChild(addressContent)
      let star = document.createElement('i')
      star.classList = "fa fa-star"
      address.appendChild(star)
      listItem.appendChild(address)
      let image = document.createElement('img')
      image.src = x.picture_url
      listItem.appendChild(image)
      let img2 = document.createElement('img')
      img2.src = x.map_image_url
      listItem.appendChild(img2)
      let description = document.createElement('p')
      let desContent = document.createTextNode(`${x.summary}`)
      description.appendChild(desContent)
      listItem.appendChild(description)
      document.querySelector('ol').appendChild(listItem)
  })
})
