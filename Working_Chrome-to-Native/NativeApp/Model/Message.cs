using Newtonsoft.Json;
using System;

namespace ExampleApp.Model
{
    class Message
    {
        [JsonProperty("signXmlText")]
        public string XmlText { get; set; }
        [JsonProperty("signReason")]
        public string SignReason { get; set; }
        [JsonProperty("signId")]
        public string SignId { get; set; }
        [JsonProperty("clientTimeStamp")]
        public string Time {
            get {
                //long date = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeMilliseconds();
                return DateTime.Now.ToFileTime().ToString();
            }
        }
    }
}