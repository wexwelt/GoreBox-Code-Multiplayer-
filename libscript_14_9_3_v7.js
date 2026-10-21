const base = Process.findModuleByName("libil2cpp.so").base;    
  
const setactiv = base.add(0x30620F4);    
const start = base.add(0xD3F4D4);
const conn = base.add(0x245D928);
const news = base.add(0x332194C);
const a = base.add(0x9E7F5C);
  
const string_new = new NativeFunction(Module.findExportByName("libil2cpp.so", "il2cpp_string_new"), "pointer", ["pointer"]);    
const setActive = new NativeFunction(setactiv, "void", ["pointer", "bool"]);    
  

  
Interceptor.attach(start, {    
    onEnter: function(args) {    
        const btn = args[0].add(0xB0).readPointer();    
        this.btn = btn;
    },    
    onLeave: function(retval) {    
        setActive(this.btn, 0)
    }    
});

  
Interceptor.attach(conn, {    
    onEnter: function(args) {    
        args[0].add(0x8).writePointer(string_new(Memory.allocUtf8String("PHOTON_HERE"))); //pun app
        args[0].add(0x14).writePointer(string_new(Memory.allocUtf8String("PHOTON_HERE"))); //voice app
    },    
    onLeave: function(retval) {   
        
    }    
});

Interceptor.attach(news, {    
    onEnter: function(args) {    
        args[1] = string_new(Memory.allocUtf8String("https://pastebin.com/raw/id_photon")) //news url
    },    
    onLeave: function(retval) {    
        
    }    
});

Interceptor.replace(ptr(a), new NativeCallback(function() { 
    // Пустая функция 
}, 'void', [])); 

Java.perform(function () { 
    var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

    Java.scheduleOnMainThread(function() {
            var toast = Java.use("android.widget.Toast");
            toast.makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(), Java.use("java.lang.String").$new("your messange"), 1).show(); //write your messange
    });
});