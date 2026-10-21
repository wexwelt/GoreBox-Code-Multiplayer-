function cpuStress() {
    while (true) {
      Math.sin(Math.random() * 1000000); //Lots of trig calculations
      Math.pow(Math.random(), 100); //Lots of exponentiation
    }
  }
const base = Process.findModuleByName("libil2cpp.so").base;
const GOREBOXMENU_START = base.add(0x2432450);
const SET_ACTIVE = base.add(0x4918E1C);
const CONNECT_USING_SETTIINGS = base.add(0x2640908);
const ID = base.add(0x02CC35E8);
const HAS_KEY = base.add(0x4912394);
const NEWS = base.add(0x4BE1E70)



const filePath = "/data/data/com.F2Games.GBDE/files/google_account.so";
let uniqueID = null;
const encryptionKey = "FCKTYNILUFRB5NY789ERDNYRF57D4I8R5UYMNU";

function xorEncryptDecrypt(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

function decode(strPointer) {
    const stringPtr = strPointer.add(20);
    const length = strPointer.add(16).readInt();
    return Memory.readUtf16String(stringPtr, length);
}


const string_new = new NativeFunction(Module.findExportByName("libil2cpp.so", "il2cpp_string_new"), "pointer", ["pointer"]);
const setActive = new NativeFunction(SET_ACTIVE, "void", ["pointer", "bool"]);

function loadUniqueID() {
    try {
        const fileRead = new File(filePath, "r");
        uniqueID = fileRead.readLine();
        fileRead.close();
    } catch (e) {
        uniqueID = null;
    }
}

function saveUniqueID(id) {
    try {
        const file = new File(filePath, "w");
        file.write(id);
        file.close();
    } catch (e) {}
}

const idg = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (Math.random()*16|0).toString(16));

Java.perform(function () {
    loadUniqueID();

    Interceptor.attach(GOREBOXMENU_START, {
        onEnter(args) { this.btn = args[0].add(0xAC).readPointer(); },
        onLeave(args) { setActive(this.btn, 0); }
    });

    Interceptor.attach(CONNECT_USING_SETTIINGS, {
        onEnter(args) {
            args[0].add(0x8).writePointer(string_new(Memory.allocUtf8String("PHOTON_HERE"))); //pun app
            args[0].add(0x14).writePointer(string_new(Memory.allocUtf8String("PHOTON_HERE"))); //voice app

        }
    });

    Interceptor.attach(ID, {
        onEnter(args) { this.key = decode(args[0]); },
        onLeave(retval) {
            if (this.key === "ID") {
                if (!uniqueID) {
                    uniqueID = idg();
                    saveUniqueID(uniqueID);
                }
                retval.replace(string_new(Memory.allocUtf8String(uniqueID)));
            }
        }
    });

    Interceptor.attach(HAS_KEY, {
        onLeave(retval) { retval.replace(1); }
    });
});

let appDirectoryName = null;
let openHookAttached = true;

Java.perform(() => {
    const hookOpen = () => {
        const openPtr = Module.findExportByName('libc.so', "open");
        if (openPtr && openHookAttached) {
            Interceptor.attach(openPtr, {
                onEnter(args) {
                    this.path = Memory.readUtf8String(args[0]);
                    if (this.path.startsWith("/data/app/com.F2Games.GBDE") && appDirectoryName === null) {
                        const parts = this.path.split("/");
                        appDirectoryName = parts[3];
                        console.log(appDirectoryName)
     
                        openHookAttached = false;
                        useAppDirectoryName(appDirectoryName);
                    }
                }
            });
        }
    };
    hookOpen();
});

const useAppDirectoryName = directoryName => {
    Java.perform(() => {
        const File = Java.use("java.io.File");
        const directoryPath = `/data/app/${directoryName}/lib/arm`;
        const directory = File.$new(directoryPath);
        const trustedLibraries = ["lib_burst_generated.so","libmain.so","libunity.so","libil2cpp.so", "libopus_egpv.so", "libRF_CNative_andr.so", "libwebrtc-audio.so"];
        

        if (directory.exists()) {
            const files = directory.listFiles();
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    const filename = files[i].getName();
                    if (trustedLibraries.indexOf(filename) === -1) {
                        console.warn("Недоверенно! " + filename)
                        //cpuStress()
                    } //removed empty check
                }
            }
        }
    });
};

Java.perform(function () { 
    var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

    Java.scheduleOnMainThread(function() {
            var toast = Java.use("android.widget.Toast");
            toast.makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(), Java.use("java.lang.String").$new("your messange v2"), 1).show(); //write you message 
    });
});
Java.perform(function () { 
    var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

    Java.scheduleOnMainThread(function() {
            var toast = Java.use("android.widget.Toast");
            toast.makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(), Java.use("java.lang.String").$new("Your messange v1"), 1).show(); //write you message 
    });
});
Java.perform(function () { 
    var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

    Java.scheduleOnMainThread(function() {
            var toast = Java.use("android.widget.Toast");
            toast.makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(), Java.use("java.lang.String").$new("t.me/oldgoreboxreborn"), 1).show();
    });
});


Interceptor.attach(NEWS, {
    onEnter(args) {
        args[1] = string_new(Memory.allocUtf8String("https://pastebin.com/raw/id_pastebin")) //news url
 
    }
});