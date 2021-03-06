﻿using Org.BouncyCastle.Tsp;
using System;
using System.Drawing;
using System.IO;
using System.Text;
using System.Xml;
using System.Xml.Serialization;
using System.Xml.XPath;

namespace XMLSigner.Library
{
    public static class Adapter
    {
        internal static DateTime? Base64DecodTime(string encodedTimeString)
        {
            try
            {
                byte[] base64EncodedBytes = Convert.FromBase64String(encodedTimeString);
                return DateTime.Parse(Encoding.UTF8.GetString(base64EncodedBytes));
            }
            catch (Exception)
            {
                try
                {
                    byte[] bytes = Convert.FromBase64String(encodedTimeString);
                    TimeStampResponse timeStampResponse = new TimeStampResponse(bytes);
                    return timeStampResponse.TimeStampToken.TimeStampInfo.GenTime;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    //throw ex;
                    return null;
                }
            }
        }

        internal static XmlDocument SerializeToXml<T>(T source)
        {
            XmlDocument document = new XmlDocument();
            XPathNavigator navigator = document.CreateNavigator();
            using (var writer = navigator.AppendChild())
            {
                XmlSerializer serializer = new XmlSerializer(typeof(T));
                serializer.Serialize(writer, source);
            }
            return document;
        }

        // Calling -> Adapter.DeSerializeFromXml<DemoData>(xmlDocument);
        internal static T DeSerializeFromXml<T>(XmlDocument xmlDocument)
        {
            return (T)new XmlSerializer(typeof(T)).Deserialize(new StringReader(xmlDocument.OuterXml));
        }
    }
}
