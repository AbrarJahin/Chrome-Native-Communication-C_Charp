using Newtonsoft.Json;

namespace ExampleApp.Model
{
    class Message
    {
        [JsonProperty("text")]
        public string Text { get; set; }
        [JsonProperty("signXmlText")]
        public string XmlText { get; set; }
        [JsonProperty("signReason")]
        public string SignReason { get; set; }
        [JsonProperty("signId")]
        public string SignId { get; set; }
    }
}