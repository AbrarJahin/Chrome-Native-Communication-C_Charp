using Newtonsoft.Json;

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
    }
}