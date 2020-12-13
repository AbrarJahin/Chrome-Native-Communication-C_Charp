using Newtonsoft.Json;

namespace ExampleApp.Model
{
    class Message
    {
        [JsonProperty("text")]
        public string Text { get; set; }
    }
}
