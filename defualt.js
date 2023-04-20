function upload(){
    //get your image
    var image=document.getElementById('image').files[0];
    //get your blog text
    var post=document.getElementById('post').value;
    //get image name
    var imageName=image.name;
    //firebase storage reference
    //it is the path where your image will be stored
    var storageRef=firebase.storage().ref('images/'+imageName);
    //upload image to selected storage reference
    //make sure you pass image here
    var uploadTask=storageRef.put(image);
    //to get the state of image uploading....
    uploadTask.on('state_changed',function(snapshot){
         //get task progress by following code
         var progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
         console.log("upload is "+progress+" done");
    },function(error){
      //handle error here
      console.log(error.message);
    },function(){
        //handle successfull upload here..
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){
           //get your image download url here and upload it to databse
           //our path where data is stored ...push is used so that every post have unique id
           firebase.database().ref('blogs/').push().set({
                 text:post,
                 imageURL:downloadURL
           },function(error){
               if(error){
                   alert("Error while uploading");
               }else{
                   alert("Successfully uploaded");
                   //now reset your form
                   document.getElementById('post-form').reset();
                   getdata();
               }
           });
        });
    });

}

window.onload=function(){
    this.getdata();
}


function getdata(){
    firebase.database().ref('blogs/').once('value').then(function(snapshot){
      //get your posts div
      var posts_div=document.getElementById('posts');
      //remove all remaining data in that div
      posts.innerHTML="";
      //get data from firebase
      var data=snapshot.val();
      console.log(data);
      //now pass this data to our posts div
      //we have to pass our data to for loop to get one by one
      //we are passing the key of that post to delete it from database
      /*for(let[key,value] of Object.entries(data)){
        posts_div.innerHTML="<div class='col-sm-4 mt-2 mb-1'>"+
        "<div class='card'>"+
        "<img src='"+value.imageURL+"' style='height:250px;'>"+
        "<div class='card-body'><p class='card-text'>"+value.text+"</p>"+
        "<button class='btn btn-danger' id='"+key+"' onclick='delete_post(this.id)'>Delete</button>"+
        "</div></div></div>"+posts_div.innerHTML;
      }*/

      for (let [key, value] of Object.entries(data)) {
        posts_div.innerHTML = "<div class='col-sm-4 mt-2 mb-1'>" +
            "<div class='card'>" +
            "<img src='" + value.imageURL + "' style='height:250px;'>" +
            "<div class='card-body'>" +
            "<h5 class='card-title'><span id='title-" + key + "'>" + value.title + "</span></h5>" + // New span element for the title
            "<p class='card-text'>" + value.text + "</p>" +
            "<button class='btn btn-primary' id='edit-" + key + "' onclick='edit_post(\"" + key + "\")'>Edit</button>" + // Modified edit button
            "<button class='btn btn-danger' id='delete-" + key + "' onclick='delete_post(\"" + key + "\")'>Delete</button>" + // Modified delete button
            "</div></div></div>" + posts_div.innerHTML;
    }
    
    
    
    });
}

function delete_post(key){
    firebase.database().ref('blogs/'+key).remove();
    getdata();

}

function edit_post(key) {
    // Get the current title from the span element
    let currentTitle = document.getElementById("title-" + key).innerHTML;
    // Create a new input field for the title
    let newTitleField = document.createElement("input");
    newTitleField.type = "text";
    newTitleField.id = "new-title-" + key;
    newTitleField.value = currentTitle;
    // Replace the span element with the input field
    document.getElementById("title-" + key).replaceWith(newTitleField);
    // Replace the "Edit" button with a "Save" button
    let editButton = document.getElementById("edit-" + key);
    editButton.innerHTML = "Save";
    editButton.setAttribute("onclick", "save_post(\"" + key + "\")");
}

function save_post(key) {
    // Get the new title from the input field
    let newTitle = document.getElementById("new-title-" + key).value;
    // Update the title in Firebase
    firebase.database().ref('blogs/' + key).update({
        title: newTitle
    });
    // Replace the input field with the span element
    let newTitleSpan = document.createElement("span");
    newTitleSpan.id = "title-" + key;
    newTitleSpan.innerHTML = newTitle;
    document.getElementById("new-title-" + key).replaceWith(newTitleSpan);
    // Replace the "Save" button with an "Edit" button
    let saveButton = document.getElementById("edit-" + key);
    saveButton.innerHTML = "Edit";
    saveButton.setAttribute("onclick", "edit_post(\"" + key + "\")");
}

