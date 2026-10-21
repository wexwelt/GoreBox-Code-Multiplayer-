const il2cppBase = Process.findModuleByName("libil2cpp.so").base;
const connectUsingSettingsAddr = il2cppBase.add(0x15200E8);
const il2cpp_string_new = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_string_new"),
    "pointer", ["pointer"]
);

Interceptor.attach(connectUsingSettingsAddr, {
    onEnter: function(args) {
        if (args[0] != null) {
            args[0].add(0x10).writePointer(
                il2cpp_string_new(Memory.allocUtf8String("PHOTON_HERE")) //MAYBE pun app
            );
        }
    },
    onLeave: function(retval) {}
});

Java.perform(function () {
    Java.scheduleOnMainThread(function() {
        for (let i = 0; i < 3; i++) {
            Java.use("android.widget.Toast")
                .makeText(
                    Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(),
                    Java.use("java.lang.String").$new("your message"), //write you messange
                    1
                ).show();
        }
    });
});
