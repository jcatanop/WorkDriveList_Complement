var Text = "NAME,FULL_PATH,TYPE,DESCRIPTION,SIZE,LAST_ACCESSED_TIME \n";
var sts = 0;
const date = new Date().toJSON().slice(0, 10);
const fileName = String(date) + "_workdrive_snapshot.csv";

async function getWorkspaces() {
  sts += 1;
  if(sts === 0 )download( Text , fileName , 'text/csv;charset=utf-8;' );
  const response = await fetch("https://workdrive.zoho.com/api/v1/organization/l15ta10ee64ff503849ffa9d333069241db48/workspaces");
  const workspaces = await response.json();

  for (let i in workspaces.data) {
    Text = Text + "\"" + workspaces.data[i].attributes.display_url_name + "\",\"/" + workspaces.data[i].attributes.display_url_name + "\",\"workspace\",\"" + workspaces.data[i].attributes.description + "\",\"" + workspaces.data[i].attributes.storage_info.size + "\",\"" + workspaces.data[i].attributes.last_accessed_time + "\" \n";
    //console.log("DATA: ", workspaces.data[i]);

    this.getFiles(workspaces.data[i].relationships.files.links.related , workspaces.data[i].attributes.display_url_name).then( _ => {
      sts -= 1;
      if(sts === 0 )download( Text , fileName , 'text/csv;charset=utf-8;' );
    })
  }
}

async function getFiles( url , path ){
  sts += 1;
  if(sts === 0 )download( Text , fileName , 'text/csv;charset=utf-8;' );
  const response = await fetch(url);
  const files = await response.json();

  for (let e in files.data) {
    Path = path + "/" + files.data[e].attributes.name;
    //console.log("NAME FILE: " , Path ,  "TYPE: ", files.data[e].attributes.type);
    Text = Text + "\"" + files.data[e].attributes.name + "\",\"/" + Path + "\",\""  + files.data[e].attributes.type + "\",\""  + files.data[e].attributes.description + "\",\"" + files.data[e].attributes.storage_info.size + "\",\"" + files.data[e].attributes.modified_time + "\" \n";
    //console.log("DATA: ", files.data[e]);
    if(files.data[e].attributes.type === 'folder'){
      
      this.getFiles(files.data[e].relationships.files.links.related , Path).then( _ => {
        sts -= 1;
        if(sts === 0 )download( Text , fileName , 'text/csv;charset=utf-8;' );
      })
    }
  }
}

function download(data, filename, type) {
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob){ // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  } else { // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
  }
}

this.getWorkspaces().then( _ => {
  sts -= 1;
  if(sts === 0 )download( Text , fileName , 'text/csv;charset=utf-8;' );
});