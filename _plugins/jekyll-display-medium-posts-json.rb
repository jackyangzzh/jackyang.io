require "net/http"
require "json"
require "nokogiri"            

module Jekyll
  class MediumPostsGenerator < Generator
    safe true
    priority :low

    def generate(site)
      username = site.config["medium_username"] || ENV["MEDIUM_USERNAME"]
      unless username
        Jekyll.logger.warn "MediumPosts:", "no medium_username configured—skipping."
        return
      end

      feed_url = "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@#{username}"
      Jekyll.logger.info  "MediumPosts:", "fetching feed_url → #{feed_url}"
      raw       = Net::HTTP.get(URI(feed_url))
      json      = JSON.parse(raw)
      items     = json["items"] || []

      Jekyll.logger.info  "MediumPosts:", "got #{items.size} items"

        site.data["medium_posts"] = items.map do |i|
        html = Nokogiri::HTML(i["description"])
        {
            "title"       => i["title"],
            "url"         => i["link"],
            "date"        => i["pubDate"],
            "thumbnail"   => html.at_css("img")&.[]("src"),  # extract first image
            "description" => html.search("p").map(&:to_html).join,
            "categories"  => i["categories"]
        }
        end
    rescue => e
      Jekyll.logger.error "MediumPosts:", "failed to fetch or parse: #{e.message}"
    end
  end
end
